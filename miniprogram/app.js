App({
  /****************************************** 公共属性 BEGIN ******************************************/

  globalData: {
    isManager: false,
    classes: null,
    classType: null,
    userInfo: null,
    signedUpClasses: null,
    openid: null
  },

  /******************************************  公共属性 END  ******************************************/





  /****************************************** 公共方法 BEGIN ******************************************/

  // 获取globalData数据
  getGlobalData({ keys, showLoading, success }) {
    // 递归func
    const _getGlobalData = (idx = 0) => {
      let func = ''
      new Promise(resolve => {
        const item = keys[idx]
        let key = ''
        let forceUpdate = false
        if (typeof item === 'string') {
          key = item
        } else {
          key = item.key
          forceUpdate = item.forceUpdate
        }

        if (this.globalData[key] === null || forceUpdate) { // 内存里没有或者强制更新
          switch (key) {
            case 'openid':
              func = '_getOpenid'
              break
            case 'classes':
              func = '_getClasses'
              break
            case 'classType':
              func = '_getClassType'
              break
            case 'userInfo':
              func = '_getUserInfo'
              break
            case 'signedUpClasses':
              func = '_getSignedUpClasses'
              break
          }
          this[func]({ forceUpdate, showLoading }).then(resolve)
        } else { // 内存里有且不强制更新
          resolve()
        }
      }).then(() => {
        if (idx + 1 < keys.length) {
          _getGlobalData(idx + 1)
        } else {
          typeof success === 'function' && success()
        }
      })
    }

    // 优化依赖链
    if (keys.length > 1) {
      const keysMap = keys.map(item => typeof item === 'string' ? item : item.key)

      const openidIdx = keysMap.indexOf('openid')
      if (openidIdx > -1 && (keysMap.indexOf('classes') > -1 || keysMap.indexOf('userInfo') > -1 || keysMap.indexOf('signedUpClasses') > -1)) {
        // 有openid的情况下又有classes或userInfo或signedUpClasses时可以移除掉openid
        keysMap.splice(openidIdx, 1)
        keys.splice(openidIdx, 1)
      }

      if (keys.length > 1) {
        const classesIdx = keysMap.indexOf('classes')
        if (classesIdx > -1 && keysMap.indexOf('signedUpClasses') > -1) {
          // 有classes的情况下又有signedUpClasses时可以移除掉classes
          keysMap.splice(classesIdx, 1)
          keys.splice(classesIdx, 1)
        }
      }
    }

    // Go
    _getGlobalData()
  },

  // 设置globalData数据
  setGlobalData(key, val, notSetStorage) {
    let func = ''
    switch (key) {
      case 'openid':
        this.globalData.openid = val
        !notSetStorage && wx.setStorage({ // 永久缓存
          key: 'openid',
          data: val
        })
        break
      case 'classes': // 不缓存
        this.globalData.classes = val
        break
      case 'classType':
      case 'userInfo':
      case 'signedUpClasses':
      default:
        this.globalData[key] = val
        !notSetStorage && wx.setStorage({ // 时效缓存
          key,
          data: {
            data: val,
            time: new Date() * 1
          }
        })
    }
  },

  // 获取课程报名成员
  getMenberList(classes, cb) {
    const db = wx.cloud.database()
    const _ = db.command

    // 拉取所有课程的自己的报名记录
    const condition = {
      classId: _.in(classes.map(item => item._id))
    }
    !this.globalData.isManager && (condition._openid = this.globalData.openid)
    const signListCollection = db.collection('sign-list').where(condition)
    signListCollection.count().then(({ total }) => { // 先获取总数
      // 递归获取所有数据
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

        classes.forEach(item => {
          item.menberList = listMap[item._id] || []
        })

        typeof cb === 'function' && cb(classes)
      })
    })
  },

  /******************************************  公共方法 END  ******************************************/





  /****************************************** 私有方法 BEGIN ******************************************/

  // 走永久缓存
  _getOpenid({ showLoading }) {
    return new Promise(resolve => {
      wx.getStorage({
        key: 'openid',
        success: ({ data }) => { // 有缓存
          this.globalData.openid = data
          resolve()
        },
        fail: () => { // 无缓存
          typeof showLoading === 'function' && showLoading()

          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: ({ result }) => {
              this.setGlobalData('openid', result.openid)
              resolve()
            },
            fail(err) {
              console.error('[云函数] [login] 调用失败', err)
            }
          })
        }
      })
    })
  },

  // 不走缓存
  _getClasses({ showLoading }) {
    return new Promise(resolve => {
      this.getGlobalData({
        keys: ['openid'],
        success: () => {
          typeof showLoading === 'function' && showLoading()

          const db = wx.cloud.database()
          const _ = db.command

          // 按时间降序来获取所有课程
          db.collection('classes').orderBy('createTime', 'desc').get({
            success: classes => {
              // 获取menberList
              this.getMenberList(classes.data, newClasses => {
                this.setGlobalData('classes', newClasses)
                resolve()
              })
            }
          })
        }
      })
    })
  },

  // 以下3个走时效缓存
  _getClassType({ forceUpdate, showLoading }) {
    return new Promise(resolve => {
      this._getTimelinessData('classType', resolve, key => {
        typeof showLoading === 'function' && showLoading()

        wx.cloud.database().collection('class-type').get().then(res => {
          this.setGlobalData(key, res.data)
          resolve()
        })
      }, 0, forceUpdate) // 暂时采用永久有效期
    })
  },
  _getUserInfo({ forceUpdate, showLoading }) {
    return new Promise(resolve => {
      this.getGlobalData({
        keys: ['openid'],
        success: () => {
          this._getTimelinessData('userInfo', resolve, key => {
            typeof showLoading === 'function' && showLoading()

            wx.cloud.database().collection('user').where({
              _openid: this.globalData.openid
            }).get().then(res => {
              this.setGlobalData(key, res.data[0])
              resolve()
            })
          }, 86400000, forceUpdate) // 1天有效期
        }
      })
    })
  },
  _getSignedUpClasses({ forceUpdate, showLoading }) {
    return new Promise(resolve => {
      this.getGlobalData({
        keys: ['openid', 'classes'],
        success: () => {
          this._getTimelinessData('signedUpClasses', resolve, key => {
            typeof showLoading === 'function' && showLoading()

            const db = wx.cloud.database()
            const _ = db.command

            db.collection('sign-list').where({
              _openid: this.globalData.openid
            }).get().then(res => {
              if (res.data.length) { // 有报过名
                const classMap = {}
                this.globalData.classes.forEach((classItem, idx) => {
                  classMap[classItem._id] = idx
                })
                this.setGlobalData(key, res.data.map(item => {
                  item.classItem = this.globalData.classes[classMap[item.classId]]
                  return item
                }))
                resolve()
              } else {
                this.setGlobalData(key, [])
                resolve()
              }
            })
          }, 86400000, forceUpdate) // 1天有效期
        }
      })
    })
  },

  // 时效缓存通用函数
  _getTimelinessData(key, success, fail, timeout, forceUpdate) {
    new Promise(resolve => {
      wx.getStorage({
        key,
        success: res => {
          if (forceUpdate || timeout && ((new Date()) * 1 - res.data.time) > timeout) { // 超时，重新拉取数据
            resolve()
          } else {
            this.setGlobalData(key, res.data.data, true) // 无需重新写入缓存
            typeof success === 'function' && success()
          }
        },
        fail: resolve
      })
    }).then(() => {
      typeof fail === 'function' && fail(key)
    })
  },

  /******************************************  私有方法 END  ******************************************/





  /****************************************** APP事件 BEGIN ******************************************/

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'develop-zcve4',
        traceUser: true
      })

      this.getGlobalData({
        keys: ['openid'],
        success: () => {
          const managerList = ['op0Ga5SBv7L-WplYadTXdHH9k0vM', 'op0Ga5e1bCfwp44jLmE4I35KAnKg', 'op0Ga5RNo4x4BObCHj0mGCV89wbQ']
          this.globalData.isManager = managerList.indexOf(this.globalData.openid) > -1
        }
      })
    }
  }

  /******************************************  APP事件 END  ******************************************/
})