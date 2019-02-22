import {
  alert,
  hideLoadingAndShowSucToast
} from '../../common/utils'

const app = getApp()

Page({
  data: {
    loading: true,
    class: {},
    spaceLeft: '',
    childInfo: [],
    isSignedUp: []
  },

  signUp(e) {
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
                alert('已经没有名额啦~')
              }
            })
          })
        } else {
          const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
          newClasses[this.idx].menberList.push({
            _openid: app.globalData.openId,
            name,
            tel
          })
          app.setClasses(newClasses)

          const afterSetPrevPage = () => {
            const afterGetSingedUpClasses = () => {
              const newClass = JSON.parse(JSON.stringify(this.data.class))
              newClass.menberList.push({
                _openid: app.globalData.openId,
                name,
                tel
              })

              const newIsSignedUp = JSON.parse(JSON.stringify(this.data.isSignedUp))
              newIsSignedUp[e.target.dataset.idx * 1] = true

              const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
              newSignedUpClasses.unshift(newClass)
              app.setGlobalData('signedUpClasses', newSignedUpClasses)

              this.setData({
                class: newClass,
                spaceLeft: this.data.spaceLeft - 1,
                isSignedUp: newIsSignedUp
              }, () => {
                hideLoadingAndShowSucToast('报名成功')
              })
            }

            if (app.globalData.signedUpClasses === null) {
              app.getSignedUpClasses(afterGetSingedUpClasses)
            } else {
              afterGetSingedUpClasses()
            }
          }

          const pages = getCurrentPages()
          if (pages.length > 1) {
            pages[pages.length - 2].setData({
              classes: newClasses
            }, afterSetPrevPage)
          } else {
            afterSetPrevPage()
          }
        }
      })
    } else { // 拒绝授权
      alert('拒绝授权的话不能报名哦~')
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
      const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
      newClasses[this.idx].menberList.splice(menberIdx, 1)
      app.setClasses(newClasses)

      const afterSetPrevPage = () => {
        const afterGetSignedUpClasses = () => {
          const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
          let idx = 0
          for (let len = newSignedUpClasses.length; idx < len; idx++) {
            if (newSignedUpClasses[idx]._id === this.data.class._id) break
          }
          newSignedUpClasses.splice(idx, 1)
          app.setGlobalData('signedUpClasses', newSignedUpClasses)

          const newClass = JSON.parse(JSON.stringify(this.data.class))
          newClass.menberList.splice(menberIdx, 1)

          const newIsSignedUp = JSON.parse(JSON.stringify(this.data.isSignedUp))
          newIsSignedUp[e.target.dataset.idx * 1] = false

          this.setData({
            class: newClass,
            spaceLeft: this.data.spaceLeft + 1,
            isSignedUp: newIsSignedUp
          }, () => {
            hideLoadingAndShowSucToast('退出报名成功')
          })
        }

        if (app.globalData.signedUpClasses === null) {
          app.getSignedUpClasses(afterGetSignedUpClasses)
        } else {
          afterGetSignedUpClasses()
        }
      }

      const pages = getCurrentPages()
      if (pages.length > 1) {
        pages[pages.length - 2].setData({
          classes: newClasses
        }, afterSetPrevPage)
      } else {
        afterSetPrevPage()
      }
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
            const childInfo = app.globalData.userInfo.childInfo
            const isSignedUp = childInfo.map(() => false)
            classItem.menberList.forEach(menber => {
              if (menber._openid === app.globalData.openId) isSignedUp[childInfo.indexOf(menber.name)] = true
            })
            this.setData({
              loading: false,
              class: classItem,
              spaceLeft: classItem.maxNum - classItem.menberList.length,
              childInfo,
              isSignedUp
            }, () => {
              wx.hideLoading()
              typeof cb === 'function' && cb()
            })
          }

          this.idx = app.getClassIdx(this.options.id)

          if (this.options.share === '1') { // 从分享入口进来的
            this.showLoading()
            wx.cloud.database().collection('classes').doc(this.options.id).get({
              success: res => render(res.data)
            })
          } else {
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

      if (this.options.share !== undefined || forceUpdate || app.globalData.classes === null) {
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