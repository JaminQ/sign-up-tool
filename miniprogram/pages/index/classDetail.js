const app = getApp()

Page({
  data: {
    class: {},
    spaceLeft: '',
    childInfo: [],
    isSignedUp: []
  },
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
  initChildInfo(cb, forceUpdate) {
    if (this.options.share === undefined && (forceUpdate || app.globalData.classes === null)) {
      app.getClasses(() => this.initOpenId(cb))
    } else {
      this.initOpenId(cb)
    }
  },
  initOpenId(cb) {
    if (app.globalData.openId === null) {
      app.getOpenId(() => this.initClass(cb))
    } else {
      this.initClass(cb)
    }
  },
  initClass(cb) {
    const done = classItem => {
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
        class: classItem,
        spaceLeft,
        childInfo,
        isSignedUp
      }, () => {
        typeof cb === 'function' && cb()
      })
    }

    if (this.options.share === '1') { // 从分享入口进来的
      wx.showLoading({
        title: '资源加载中',
        mask: true
      })

      wx.cloud.database().collection('classes').doc(this.options.id).get({
        success: res => {
          done(res.data)
          wx.hideLoading()
        }
      })
    } else {
      this.idx = this.options.idx * 1
      done(app.globalData.classes[this.idx])
    }
  },
  onLoad() {
    if (app.globalData.userInfo === null) {
      app.getUserInfo(this.initChildInfo)
    } else {
      this.initChildInfo()
    }
  },
  onPullDownRefresh() {
    app.getUserInfo(() => {
      this.initChildInfo(wx.stopPullDownRefresh, true)
    }, true)
  },
  onShareAppMessage(res) {
    return {
      title: `“${this.data.class.name}”开始报名啦~`,
      path: `/pages/index/classDetail?id=${this.data.class._id}&share=1`,
      imageUrl: '../../image/share.jpg'
    }
  }
})