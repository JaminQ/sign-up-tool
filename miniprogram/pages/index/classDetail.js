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
        wx.cloud.callFunction({
          name: 'class',
          data: {
            type: 'signUp',
            _id: this.data.class._id,
            name
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
              name
            })

            this.setData({
              class: newClass,
              spaceLeft: this.data.spaceLeft - 1,
              isSignedUp: newIsSignedUp
            }, () => {
              const pages = getCurrentPages()
              const prevPage = pages[pages.length - 2]
              const newClasses = JSON.parse(JSON.stringify(prevPage.data.classes))
              newClasses[this.idx].menberList.push({
                _openid: app.globalData.openId,
                name
              })
              app.setClasses(newClasses)
              prevPage.setData({
                classes: newClasses
              }, () => {
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
              })
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
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        const newClasses = JSON.parse(JSON.stringify(prevPage.data.classes))
        newClasses[this.idx].menberList.splice(menberIdx, 1)
        app.setClasses(newClasses)
        prevPage.setData({
          classes: newClasses
        }, () => {
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
        })
      })
    })
  },
  initChildInfo() {
    const userInfo = app.globalData.userInfo
    this.setData({
      childInfo: app.globalData.userInfo.childInfo,
      isSignedUp: app.globalData.userInfo.childInfo.map(() => false)
    }, () => {
      if (app.globalData.classes === null) {
        app.getClasses(this.initOpenId)
      } else {
        this.initOpenId()
      }
    })
  },
  initOpenId() {
    if (app.globalData.openId === null) {
      app.getOpenId(this.initClass)
    } else {
      this.initClass()
    }
  },
  initClass() {
    const classItem = app.globalData.classes[this.idx]
    let spaceLeft = classItem.maxNum
    const childInfo = this.data.childInfo
    const isSignedUp = this.data.isSignedUp
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
      isSignedUp
    })
  },
  onLoad(e) {
    this.idx = e.idx * 1

    if (app.globalData.userInfo === null) {
      app.getUserInfo(this.initChildInfo)
    } else {
      this.initChildInfo()
    }
  }
})