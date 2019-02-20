import { setStorage } from 'common/utils'

App({
  globalData: {
    classes: null,
    classType: null,
    userInfo: null,
    signedUpClasses: null,
    openId: null
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
  getOpenId(cb) {
    wx.getStorage({
      key: 'openid',
      success: res => { // 有缓存
        this.globalData.openId = res.data
        typeof cb === 'function' && cb()
      },
      fail: () => { // 无缓存
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            this.globalData.openId = res.result.openid
            wx.setStorage({ // 缓存openid
              key: 'openid',
              data: this.globalData.openId
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
  getClassType(cb, forceUpdate, isLoading) {
    this.getGlobalData('classType', cb, key => {
      wx.cloud.database().collection('class-type').get().then(res => this.afterAjax(key, res.data, cb, isLoading))
    }, 0, forceUpdate) // 暂时采用永久有效期
  },
  getUserInfo(cb, forceUpdate, isLoading) {
    const _getData = key => {
      wx.cloud.database().collection('user').where({
        _openid: this.globalData.openId
      }).get().then(res => this.afterAjax(key, res.data[0], cb, isLoading))
    }

    this.getGlobalData('userInfo', cb, key => {
      if (this.globalData.openId === null) {
        this.getOpenId(() => {
          _getData(key)
        })
      } else {
        _getData(key)
      }
    }, 1, forceUpdate) // 3天有效期
    // 259200000
  },
  getSignedUpClasses(cb, forceUpdate, isLoading) {
    const _getData = key => {
      const db = wx.cloud.database()
      const _ = db.command

      if (this.globalData.userInfo.classes.length) {
        db.collection('classes').where({
          _id: _.or(this.globalData.userInfo.classes.map(id => _.eq(id)))
        }).get().then(res => this.afterAjax(key, res.data, cb, isLoading))
      } else {
        this.afterAjax(key, [], cb, isLoading)
      }
    }

    this.getGlobalData('signedUpClasses', cb, key => {
      if (forceUpdate || this.globalData.userInfo === null) {
        this.getUserInfo(() => {
          _getData(key)
        }, forceUpdate, true)
      } else {
        _getData(key)
      }
    }, 1, forceUpdate) // 3天有效期
  },

  // 时效缓存通用函数
  getGlobalData(key, cb, ajaxCb, timeout, forceUpdate) {
    const ajax = () => {
      // wx.showLoading({
      //   title: '资源加载中',
      //   mask: true
      // })
      typeof ajaxCb === 'function' && ajaxCb(key)
    }

    wx.getStorage({
      key,
      success: res => {
        if (forceUpdate || timeout && ((new Date()) * 1 - res.data.time) > timeout) { // 超时，重新拉取数据
          ajax()
        } else {
          this.setGlobalData(key, res.data.data, true)
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
  afterAjax(key, val, cb, isLoading) {
    console.log(key, val)
    this.setGlobalData(key, val)
    typeof cb === 'function' && cb()
    // !isLoading && wx.hideLoading()
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