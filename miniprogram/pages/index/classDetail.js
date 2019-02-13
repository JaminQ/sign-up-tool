const app = getApp()

Page({
  data: {
    class: {},
    spaceLeft: '',
    isSignUp: false
  },
  signUp(e) {
    if (this.data.spaceLeft >= 0) {
      if (e.detail.userInfo !== undefined) {
        wx.showLoading({
          title: '报名中',
          mask: true
        })

        const nickName = e.detail.userInfo.nickName
        wx.cloud.callFunction({
          name: 'class',
          data: {
            type: 'signUp',
            _id: this.data.class._id,
            name: nickName
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
            const pages = getCurrentPages()
            const prevPage = pages[pages.length - 2]
            const newClasses = JSON.parse(JSON.stringify(prevPage.data.classes))
            const newClass = JSON.parse(JSON.stringify(this.data.class))
            newClasses[this.idx].menberList.push({
              _openid: app.globalData.openId,
              name: nickName
            })
            newClass.menberList.push({
              _openid: app.globalData.openId,
              name: nickName
            })
            this.menberIdx = newClass.menberList.length - 1
            this.setData({
              class: newClass,
              spaceLeft: this.data.spaceLeft - 1,
              isSignUp: true
            }, () => {
              app.setClasses(newClasses)
              prevPage.setData({
                classes: newClasses
              }, () => {
                wx.hideLoading({
                  success() {
                    wx.showToast({
                      title: '报名成功',
                      duration: 500
                    })
                  }
                })
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
  signOut() {
    wx.showLoading({
      title: '退出报名中',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'class',
      data: {
        type: 'signOut',
        _id: this.data.class._id,
        menberIdx: this.menberIdx
      }
    }).then(res => {
      console.log(res)
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      const newClasses = JSON.parse(JSON.stringify(prevPage.data.classes))
      const newClass = JSON.parse(JSON.stringify(this.data.class))
      newClasses[this.idx].menberList.splice(this.menberIdx, 1)
      newClass.menberList.splice(this.menberIdx, 1)
      this.setData({
        class: newClass,
        spaceLeft: this.data.spaceLeft + 1,
        isSignUp: false
      }, () => {
        app.setClasses(newClasses)
        prevPage.setData({
          classes: newClasses
        }, () => {
          wx.hideLoading({
            success() {
              wx.showToast({
                title: '退出报名成功',
                duration: 500
              })
            }
          })
        })
      })
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
    let isSignUp = false
    classItem.menberList.forEach((menber, menberIdx) => {
      if (menber !== null) {
        spaceLeft--
        if (menber._openid === app.globalData.openId) {
          this.menberIdx = menberIdx
          isSignUp = true
        }
      }
    })
    this.setData({
      class: classItem,
      spaceLeft,
      isSignUp
    })
  },
  onLoad(e) {
    this.idx = e.idx * 1

    if (app.globalData.classes === null) {
      app.getClasses(this.initOpenId)
    } else {
      this.initOpenId()
    }
  }
})