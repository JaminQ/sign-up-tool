import {
  setStorage
} from 'common/utils'

App({
  globalData: {
    classes: null,
    classType: null,
    userInfo: null,
    signedUpClasses: null,
    openid: null
  },

  // 业务代码自己保证globalData.classes有值
  getClass(_id) {
    const classes = JSON.parse(JSON.stringify(this.globalData.classes))
    for (let i = 0, len = classes.length; i < len; i++) {
      if (classes[i]._id === _id) return classes[i]
    }
  },
  getClassIdx(_id) {
    const classes = JSON.parse(JSON.stringify(this.globalData.classes))
    for (let i = 0, len = classes.length; i < len; i++) {
      if (classes[i]._id === _id) return i
    }
  },

  // 不走缓存
  getClasses(cb) {
    wx.cloud.database().collection('classes').orderBy('createTime', 'desc').get({
      success: res => {
        console.log('classes', res)
        this.setClasses(res.data)
        typeof cb === 'function' && cb()
      }
    })
  },
  setClasses(classes) {
    this.globalData.classes = classes
  },

  // 走永久缓存
  getOpenid(cb) {
    wx.getStorage({
      key: 'openid',
      success: res => { // 有缓存
        this.globalData.openid = res.data
        typeof cb === 'function' && cb()
      },
      fail: () => { // 无缓存
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            this.globalData.openid = res.result.openid
            wx.setStorage({ // 缓存openid
              key: 'openid',
              data: this.globalData.openid
            })
            typeof cb === 'function' && cb()
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
          }
        })
      }
    })
  },

  // 以下3个走时效缓存
  getClassType(cb, forceUpdate) {
    this.getGlobalData('classType', cb, key => {
      wx.cloud.database().collection('class-type').get().then(res => this.afterAjax(key, res.data, cb))
    }, 0, forceUpdate) // 暂时采用永久有效期
  },
  getUserInfo(cb, forceUpdate) {
    this.getGlobalData('userInfo', cb, key => {
      const _getUserInfo = () => {
        wx.cloud.database().collection('user').where({
          _openid: this.globalData.openid
        }).get().then(res => this.afterAjax(key, res.data[0], cb))
      }

      if (this.globalData.openid === null) {
        this.getOpenid(_getUserInfo)
      } else {
        _getUserInfo()
      }
    }, 86400000, forceUpdate) // 1天有效期
  },
  getSignedUpClasses(cb, forceUpdate) {
    this.getGlobalData('signedUpClasses', cb, key => {
      const _getSignedUpClasses = () => {
        const db = wx.cloud.database()
        const _ = db.command

        if (this.globalData.userInfo.classes.length) { // 有报过名
          db.collection('classes').where({
            _id: _.or(this.globalData.userInfo.classes.map(id => _.eq(id)))
          }).get().then(res => this.afterAjax(key, res.data, cb))
        } else {
          this.afterAjax(key, [], cb)
        }
      }

      if (forceUpdate || this.globalData.userInfo === null) {
        this.getUserInfo(_getSignedUpClasses, forceUpdate)
      } else {
        _getSignedUpClasses()
      }
    }, 86400000, forceUpdate) // 1天有效期
  },

  // 时效缓存通用函数
  getGlobalData(key, cb, ajaxCb, timeout, forceUpdate) {
    const ajax = () => {
      typeof ajaxCb === 'function' && ajaxCb(key)
    }

    wx.getStorage({
      key,
      success: res => {
        if (forceUpdate || timeout && ((new Date()) * 1 - res.data.time) > timeout) { // 超时，重新拉取数据
          ajax()
        } else {
          this.setGlobalData(key, res.data.data, true) // 无需重新写入缓存
          typeof cb === 'function' && cb()
        }
      },
      fail: ajax
    })
  },
  setGlobalData(key, val, notUpdate) {
    this.globalData[key] = val
    !notUpdate && setStorage(key, val)
  },
  afterAjax(key, val, cb) {
    console.log(key, val)
    this.setGlobalData(key, val) // 需要写入缓存
    typeof cb === 'function' && cb()
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true
      })
    }
  }
})