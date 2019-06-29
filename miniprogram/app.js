import {
  setStorage
} from 'common/utils'

App({
  globalData: {
    isManager: false,
    classes: null,
    classType: null,
    userInfo: null,
    signedUpClasses: null,
    openid: null
  },

  // 不走缓存
  getClasses(cb) {
    const _getClasses = () => {
      const db = wx.cloud.database()
      const _ = db.command

      // 按时间降序来获取所有课程
      db.collection('classes').orderBy('createTime', 'desc').get({
        success: classes => {
          // 拉取所有课程的自己的报名记录
          const condition = {
            classId: _.in(classes.data.map(item => item._id))
          }
          !this.globalData.isManager && (condition._openid = this.globalData.openid)
          const signListCollection = db.collection('sign-list').where(condition)
          signListCollection.count().then(({ total }) => {
            const getAllData = (signList, cb) => {
              signListCollection.skip(signList.length).get({
                success: list => {
                  signList = signList.concat(list.data)
                  if (signList.length < total) getAllData(signList, cb)
                  else typeof cb === 'function' && cb(signList)
                }
              })
            }
            getAllData([], signList => {
              const listMap = {}
              signList.forEach(item => {
                const classId = item.classId
                if (listMap[classId]) {
                  listMap[classId].push(item)
                } else {
                  listMap[classId] = [item]
                }
              })

              classes.data.forEach(item => {
                item.menberList = listMap[item._id] || []
              })

              this.setClasses(classes.data)
              typeof cb === 'function' && cb()
            })
          })
        }
      })
    }

    if (this.globalData.openid === null) {
      this.getOpenid(_getClasses)
    } else {
      _getClasses()
    }
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
    }, 1, forceUpdate) // 1天有效期
    // 86400000
  },
  getSignedUpClasses(cb, forceUpdate) {
    this.getGlobalData('signedUpClasses', cb, key => {
      const _getClasses = () => {
        const _getSignedUpClasses = () => {
          const db = wx.cloud.database()
          const _ = db.command

          db.collection('sign-list').where({
            _openid: this.globalData.userInfo._openid
          }).get().then(res => {
            if (res.data.length) { // 有报过名
              const classMap = {};
              this.globalData.classes.forEach((classItem, idx) => {
                classMap[classItem._id] = idx
              })
              this.afterAjax(key, res.data.map(item => {
                const classItem = this.globalData.classes[classMap[item.classId]]
                item.classItem = classItem
                return item
              }), cb);
            } else {
              this.afterAjax(key, [], cb)
            }
          })
        }

        if (this.globalData.classes === null) {
          this.getClasses(_getSignedUpClasses)
        } else {
          _getSignedUpClasses()
        }
      }

      if (forceUpdate || this.globalData.userInfo === null) {
        this.getUserInfo(_getClasses, forceUpdate)
      } else {
        _getClasses()
      }
    }, 1, forceUpdate) // 1天有效期
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
        // env: 'develop-zcve4',
        env: 'sign-up-652910',
        traceUser: true
      })

      const isManager = () => {
        const managerList = ['op0Ga5SBv7L-WplYadTXdHH9k0vM', 'op0Ga5e1bCfwp44jLmE4I35KAnKg', 'op0Ga5RNo4x4BObCHj0mGCV89wbQ']
        this.globalData.isManager = managerList.indexOf(this.globalData.openid) > -1
      }

      if (this.globalData.openid === null) {
        this.getOpenid(isManager)
      } else {
        isManager()
      }
    }
  }
})