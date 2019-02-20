const app = getApp()

Page({
  data: {
    loading: true,
    class: {},
    spaceLeft: '',
    childInfo: [],
    isSignedUp: []
  },

  // TODO: 待重构优化
  signUp(e) {
    if (this.data.spaceLeft >= 0) {
      if (e.detail.userInfo !== undefined) {
        wx.showLoading({
          title: '报名中',
          mask: true
        })

        const name = e.target.dataset.name
        const tel = app.globalData.userInfo.tel
        wx.cloud.callFunction({
          name: 'class',
          data: {
            type: 'signUp',
            _id: this.data.class._id,
            name,
            tel
          }
        }).then(res => {
          if (res.result.ret === -10001) { // 课程报名人数已满
            this.setData({
              spaceLeft: 0
            }, () => {
              wx.hideLoading({
                success() {
                  wx.showModal({
                    content: '已经没有名额啦~',
                    showCancel: false
                  });
                }
              })
            })
          } else {
            const newIsSignedUp = JSON.parse(JSON.stringify(this.data.isSignedUp))
            newIsSignedUp[e.target.dataset.idx * 1] = true

            const newClass = JSON.parse(JSON.stringify(this.data.class))
            newClass.menberList.push({
              _openid: app.globalData.openId,
              name,
              tel
            })

            this.setData({
              class: newClass,
              spaceLeft: this.data.spaceLeft - 1,
              isSignedUp: newIsSignedUp
            }, () => {
              const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
              newClasses[this.idx].menberList.push({
                _openid: app.globalData.openId,
                name,
                tel
              })
              app.setClasses(newClasses)

              const cb = () => {
                const done = () => {
                  const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
                  newSignedUpClasses.unshift(newClass)
                  app.setGlobalData('signedUpClasses', newSignedUpClasses)

                  wx.hideLoading({
                    success() {
                      wx.showToast({
                        title: '报名成功',
                        duration: 500
                      })
                    }
                  })
                }

                if (app.globalData.signedUpClasses === null) {
                  app.getSignedUpClasses(done)
                } else {
                  done()
                }
              }

              const pages = getCurrentPages()
              if (pages.length > 1) {
                pages[pages.length - 2].setData({
                  classes: newClasses
                }, cb)
              } else {
                cb()
              }
            })
          }
        })
      } else { // 拒绝授权
        wx.showModal({
          content: '拒绝授权的话不能报名哦~',
          showCancel: false
        });
      }
    } else {
      wx.showModal({
        content: '已经没有名额啦~',
        showCancel: false
      });
    }
  },
  signOut(e) {
    wx.showLoading({
      title: '退出报名中',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'class',
      data: {
        type: 'signOut',
        _id: this.data.class._id,
        name: e.target.dataset.name
      }
    }).then(res => {
      const menberIdx = res.result.menberIdx

      const newIsSignedUp = JSON.parse(JSON.stringify(this.data.isSignedUp))
      newIsSignedUp[e.target.dataset.idx * 1] = false

      const newClass = JSON.parse(JSON.stringify(this.data.class))
      newClass.menberList.splice(menberIdx, 1)
      this.setData({
        class: newClass,
        spaceLeft: this.data.spaceLeft + 1,
        isSignedUp: newIsSignedUp
      }, () => {
        const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
        newClasses[this.idx].menberList.splice(menberIdx, 1)
        app.setClasses(newClasses)

        const cb = () => {
          const done = () => {
            const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
            let idx = 0
            for (let len = newSignedUpClasses.length; idx < len; idx++) {
              if (newSignedUpClasses[idx]._id === newClass._id) break
            }
            newSignedUpClasses.splice(idx, 1)
            app.setGlobalData('signedUpClasses', newSignedUpClasses)

            wx.hideLoading({
              success() {
                wx.showToast({
                  title: '退出报名成功',
                  duration: 500
                })
              }
            })
          }

          if (app.globalData.signedUpClasses === null) {
            app.getSignedUpClasses(done)
          } else {
            done()
          }
        }

        const pages = getCurrentPages()
        if (pages.length > 1) {
          pages[pages.length - 2].setData({
            classes: newClasses
          }, cb)
        } else {
          cb()
        }
      })
    })
  },

  showLoading() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
  },
  init(forceUpdate, cb) {
    const getClasses = () => {
      const getOpenId = () => {
        const getClass = () => {
          const render = classItem => {
            let spaceLeft = classItem.maxNum
            const childInfo = app.globalData.userInfo.childInfo
            const isSignedUp = childInfo.map(() => false)
            classItem.menberList.forEach(menber => {
              if (menber !== null) {
                spaceLeft--
                if (menber._openid === app.globalData.openId) {
                  isSignedUp[childInfo.indexOf(menber.name)] = true
                }
              }
            })
            this.setData({
              loading: false,
              class: classItem,
              spaceLeft,
              childInfo,
              isSignedUp
            }, () => {
              wx.hideLoading()
              typeof cb === 'function' && cb()
            })
          }

          if (this.options.share === '1') { // 从分享入口进来的
            this.showLoading()
            wx.cloud.database().collection('classes').doc(this.options.id).get({
              success: res => render(res.data)
            })
          } else {
            this.idx = this.options.idx * 1
            render(app.globalData.classes[this.idx])
          }
        }

        if (app.globalData.openId === null) {
          this.showLoading()
          app.getOpenId(getClass)
        } else {
          getClass()
        }
      }

      // TODO: 改为用_id查找课程而不是索引
      if (this.options.share === undefined && (forceUpdate || app.globalData.classes === null)) {
        this.showLoading()
        app.getClasses(getOpenId)
      } else {
        getOpenId()
      }
    }

    if (forceUpdate || app.globalData.userInfo === null) {
      this.showLoading()
      app.getUserInfo(getClasses, forceUpdate)
    } else {
      getClasses()
    }
  },
  onLoad() {
    this.init()
  },
  onPullDownRefresh() {
    this.init(true, wx.stopPullDownRefresh)
  },
  onShareAppMessage(res) {
    return {
      title: `“${this.data.class.name}”开始报名啦~`,
      path: `/pages/index/classDetail?id=${this.data.class._id}&share=1`,
      imageUrl: '../../image/share.jpg'
    }
  }
})