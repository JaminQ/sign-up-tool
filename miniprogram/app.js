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

  // 获取globalData数据
  getGlobalData(dataList, cb) {
    const _getData = (idx = 0) => {
      let func = '';
      new Promise(resolve => {
        if (this.globalData[dataList[idx]] === null) { // 内存里没有
          switch (dataList[idx]) {
            case 'openid':
              func = 'getOpenid'
              break
            case 'classes':
              func = 'getClasses'
              break
            case 'classType':
              func = 'getClassType'
              break
            case 'userInfo':
              func = 'getUserInfo'
              break
            case 'signedUpClasses':
              func = 'getSignedUpClasses'
              break
          }
          this[func]().then(resolve)
        } else { // 内存里有
          resolve()
        }
      }).then(() => {
        if (idx + 1 < dataList.length) {
          _getData(idx + 1)
        } else {
          typeof cb === 'function' && cb()
        }
      })
    }

    _getData()
  },
  setGlobalData(key, val, notUpdateStorage) {
    this.globalData[key] = val
    !notUpdateStorage && setStorage(key, val)
  },

  // 不走缓存
  getClasses() {
    return new Promise(resolve => {
      if (this.globalData.classes === null) { // 内存里没有
        this.getGlobalData(['openid'], () => {
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

                  classes.data.forEach(item => {
                    item.menberList = listMap[item._id] || []
                  })

                  this.setClasses(classes.data)
                  resolve()
                })
              })
            }
          })
        })
      } else { // 内存里有
        resolve()
      }
    })
  },
  setClasses(val) {
    this.globalData.classes = val
  },

  // 走永久缓存
  getOpenid() {
    return new Promise(resolve => {
      wx.getStorage({
        key: 'openid',
        success: ({ data }) => { // 有缓存
          this.globalData.openid = data
          resolve()
        },
        fail: () => { // 无缓存
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: ({ result }) => {
              this.setOpenid(result.openid)
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
  setOpenid(val) {
    this.globalData.openid = val
    wx.setStorage({ // 缓存openid
      key: 'openid',
      data: val
    })
  },

  // 以下3个走时效缓存
  getClassType(forceUpdate) {
    return new Promise(resolve => {
      if (this.globalData.classType === null) { // 内存里没有
        this.getTimelinessData('classType', resolve, key => {
          wx.cloud.database().collection('class-type').get().then(res => this.setTimelinessData(key, res.data, resolve))
        }, 0, forceUpdate) // 暂时采用永久有效期
      } else { // 内存里有
        resolve()
      }
    })
  },
  getUserInfo(forceUpdate) {
    return new Promise(resolve => {
      if (this.globalData.userInfo === null) { // 内存里没有
        this.getGlobalData(['openid'], () => {
          this.getTimelinessData('userInfo', resolve, key => {
            wx.cloud.database().collection('user').where({
              _openid: this.globalData.openid
            }).get().then(res => this.setTimelinessData(key, res.data[0], resolve))
          }, 86400000, forceUpdate) // 1天有效期
        })
      } else { // 内存里有
        resolve()
      }
    })
  },
  getSignedUpClasses(forceUpdate) {
    return new Promise(resolve => {
      if (this.globalData.signedUpClasses === null) { // 内存里没有
        this.getGlobalData(['openid', 'classes'], () => {
          this.getTimelinessData('signedUpClasses', resolve, key => {
            const db = wx.cloud.database()
            const _ = db.command

            db.collection('sign-list').where({
              _openid: this.globalData.openid
            }).get().then(res => {
              if (res.data.length) { // 有报过名
                const classMap = {};
                this.globalData.classes.forEach((classItem, idx) => {
                  classMap[classItem._id] = idx
                })
                this.setTimelinessData(key, res.data.map(item => {
                  item.classItem = this.globalData.classes[classMap[item.classId]]
                  return item
                }), resolve);
              } else {
                this.setTimelinessData(key, [], resolve)
              }
            })
          }, 1, forceUpdate) // 1天有效期
        })
      } else { // 内存里有
        resolve()
      }
    })
  },

  // 时效缓存通用函数
  getTimelinessData(key, success, fail, timeout, forceUpdate) {
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
  setTimelinessData(key, val, cb) {
    this.setGlobalData(key, val) // 需要写入缓存
    typeof cb === 'function' && cb()
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'develop-zcve4',
        traceUser: true
      })

      this.getGlobalData(['openid'], () => {
        const managerList = ['op0Ga5SBv7L-WplYadTXdHH9k0vM', 'op0Ga5e1bCfwp44jLmE4I35KAnKg', 'op0Ga5RNo4x4BObCHj0mGCV89wbQ']
        this.globalData.isManager = managerList.indexOf(this.globalData.openid) > -1
      })
    }
  }
})