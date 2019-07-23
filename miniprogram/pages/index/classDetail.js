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
    childInfo: [],
    isSignedUp: []
  },

  // 返回
  back() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 报名
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
          // 更新globalData.classes
          const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
          newClasses[this.idx].leftNum = 0 // 将剩余名额设为0
          app.setGlobalData('classes', newClasses)

          // 更新页面数据
          this.setData({
            class: newClasses[this.idx]
          }, () => wx.hideLoading({
            success() {
              alert('已经没有名额啦~')
            }
          }))
        } else {
          // 报名学员对象
          const menber = {
            _id: res.result._id,
            _openid: app.globalData.openid,
            classId: this.data.class._id,
            name,
            tel
          }

          // 更新globalData.classes
          const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
          newClasses[this.idx].menberList.push(menber)
          newClasses[this.idx].leftNum-- // 名额-1
          app.setGlobalData('classes', newClasses)

          // 如果内存里有signedUpClasses则更新globalData.signedUpClasses
          // TODO: 因为内存里可能有数据，所以还是要更新一下
          if (app.globalData.signedUpClasses) {
            const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
            newSignedUpClasses.push(Object.assign({
              classItem: newClass
            }, menber))
            app.setGlobalData('signedUpClasses', newSignedUpClasses)
          }

          // 更新页面数据
          const newClass = this.data.class
          newClass.menberList.push(menber)
          newClass.leftNum-- // 名额-1

          const newIsSignedUp = this.data.isSignedUp
          newIsSignedUp[e.target.dataset.idx * 1] = true

          this.setData({
            class: newClass,
            isSignedUp: newIsSignedUp
          }, () => hideLoadingAndShowSucToast('报名成功'))
        }
      })
    } else { // 拒绝授权
      alert('拒绝授权的话不能报名哦~')
    }
  },

  // 退出报名
  signOut(e) {
    wx.showLoading({
      title: '退出报名中',
      mask: true
    })

    const childName = e.target.dataset.name
    wx.cloud.callFunction({
      name: 'class',
      data: {
        type: 'signOut',
        _id: this.data.class._id,
        name: childName
      }
    }).then(res => {
      // 更新globalData.classes
      const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
      let menberIdx = -1
      newClasses[this.idx].menberList.some((menber, idx) => {
        if (menber._openid === app.globalData.openid && menber.name === childName) {
          menberIdx = idx
          return true
        }
        return false
      })
      newClasses[this.idx].menberList.splice(menberIdx, 1)
      newClasses[this.idx].leftNum++ // 名额+1
      app.setGlobalData('classes', newClasses)

      // 如果内存里有signedUpClasses则更新globalData.signedUpClasses
      // TODO: 因为内存里可能有数据，所以还是要更新一下
      if (app.globalData.signedUpClasses) {
        const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
        let signedUpClassIdx = -1
        newSignedUpClasses.some((classItem, idx) => {
          if (classItem.classItem._id === this.data.class._id && classItem.name === childName) {
            signedUpClassIdx = idx
            return true
          }
          return false
        })
        newSignedUpClasses.splice(signedUpClassIdx, 1)
        app.setGlobalData('signedUpClasses', newSignedUpClasses)
      }

      // 更新页面数据
      const newClass = this.data.class
      newClass.menberList.splice(menberIdx, 1)
      newClass.leftNum++ // 名额+1

      const newIsSignedUp = this.data.isSignedUp
      newIsSignedUp[e.target.dataset.idx * 1] = false

      this.setData({
        class: newClass,
        isSignedUp: newIsSignedUp
      }, () => hideLoadingAndShowSucToast('退出报名成功'))
    })
  },

  init(forceUpdate, cb) {
    app.getGlobalData({
      keys: ['openid', {
        key: 'classes',
        forceUpdate
      }, {
        key: 'userInfo',
        forceUpdate
      }],
      showLoading() {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
      },
      success: () => {
        new Promise(resolve => {
          this.idx = getClassIdx(app.globalData.classes, this.options.id)

          if (this.options.share === '1') { // 从分享入口进来的
            wx.cloud.database().collection('classes').doc(this.options.id).get({
              success: res => app.getMenberList([res.data], classes => resolve(classes[0])) // 获取menberList
            })
          } else {
            resolve(app.globalData.classes[this.idx])
          }
        }).then(classItem => {
          const childInfo = app.globalData.userInfo.childInfo
          const isSignedUp = childInfo.map(() => false)
          classItem.menberList.forEach(menber => {
            if (menber._openid === app.globalData.openid) isSignedUp[childInfo.indexOf(menber.name)] = true
          })
          this.setData({
            loading: false,
            class: classItem,
            childInfo,
            isSignedUp
          }, () => {
            wx.hideLoading()
            typeof cb === 'function' && cb()
          })
        })
      }
    })
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
  onShow() {
    // 更新数据
    !this.data.loading && this.setData({
      childInfo: app.globalData.userInfo.childInfo
    })
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