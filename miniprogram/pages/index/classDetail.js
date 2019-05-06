import {
  alert,
  hideLoadingAndShowSucToast,
  getClass,
  getClassIdx
} from '../../common/utils'

const app = getApp()

Page({
  data: {
    showBackBtn: false,
    loading: true,
    class: {},
    spaceLeft: '',
    childInfo: [],
    isSignedUp: []
  },

  back() {
    wx.navigateBack({
      delta: 1
    })
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
            _openid: app.globalData.openid,
            name,
            tel
          })
          app.setClasses(newClasses)

          const afterSetPrevPage = () => {
            const afterGetSingedUpClasses = () => {
              const newClass = JSON.parse(JSON.stringify(this.data.class))
              newClass.menberList.push({
                _openid: app.globalData.openid,
                name,
                tel
              })

              const newIsSignedUp = JSON.parse(JSON.stringify(this.data.isSignedUp))
              newIsSignedUp[e.target.dataset.idx * 1] = true

              this.setData({
                class: newClass,
                spaceLeft: this.data.spaceLeft - 1,
                isSignedUp: newIsSignedUp
              }, () => {
                const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
                const signedUpClassIdx = getClassIdx(newSignedUpClasses, newClass._id)
                if (signedUpClassIdx === -1) { // 没有其余孩子报名过这门课
                  newSignedUpClasses.unshift(newClass)
                } else { // 其余孩子已报名过这门课
                  newSignedUpClasses[signedUpClassIdx] = newClass
                }
                app.setGlobalData('signedUpClasses', newSignedUpClasses)

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
          const newClass = JSON.parse(JSON.stringify(this.data.class))
          newClass.menberList.splice(menberIdx, 1)

          const newIsSignedUp = JSON.parse(JSON.stringify(this.data.isSignedUp))
          newIsSignedUp[e.target.dataset.idx * 1] = false

          this.setData({
            class: newClass,
            spaceLeft: this.data.spaceLeft + 1,
            isSignedUp: newIsSignedUp
          }, () => {
            const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
            const signedUpClassIdx = getClassIdx(newSignedUpClasses, newClass._id)
            // 如果所有孩子都未报名，就移除掉这条记录
            let shouldSplice = true
            for (let i = 0, len = newIsSignedUp.length; i < len; i++) {
              if (newIsSignedUp[i]) {
                shouldSplice = false
                break
              }
            }
            if (shouldSplice) {
              newSignedUpClasses.splice(signedUpClassIdx, 1)
            } else {
              newSignedUpClasses[signedUpClassIdx] = newClass
            }
            app.setGlobalData('signedUpClasses', newSignedUpClasses)

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
      const getOpenid = () => {
        const getClass = () => {
          const render = classItem => {
            const childInfo = app.globalData.userInfo.childInfo
            const isSignedUp = childInfo.map(() => false)
            classItem.menberList.forEach(menber => {
              if (menber._openid === app.globalData.openid) isSignedUp[childInfo.indexOf(menber.name)] = true
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

          this.idx = getClassIdx(app.globalData.classes, this.options.id)

          if (this.options.share === '1') { // 从分享入口进来的
            this.showLoading()
            wx.cloud.database().collection('classes').doc(this.options.id).get({
              success: res => render(res.data)
            })
          } else {
            render(app.globalData.classes[this.idx])
          }
        }

        if (app.globalData.openid === null) {
          this.showLoading()
          app.getOpenid(getClass)
        } else {
          getClass()
        }
      }

      if (this.options.share !== undefined || forceUpdate || app.globalData.classes === null) {
        this.showLoading()
        app.getClasses(getOpenid)
      } else {
        getOpenid()
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
    // 如果页面堆栈数大于1，显示返回按钮
    if (getCurrentPages().length > 1) {
      this.setData({
        showBackBtn: true
      })
    }

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