import {
  alert,
  hideLoadingAndShowSucToast,
  getClassIdx
} from '../../common/utils'

const app = getApp()

Page({
  data: {
    loading: true,
    class: {}
  },

  exportData() {
    alert('还没做哦~要不你请我吃饭，我给你加班做出来？')
  },

  removeMenber(e) {
    const name = e.currentTarget.dataset.name
    wx.showModal({
      title: '确定删除吗',
      content: name,
      confirmText: '删除',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
            mask: true
          })

          wx.cloud.callFunction({
            name: 'class',
            data: {
              type: 'signOut',
              _id: this.data.class._id,
              name
            }
          }).then(res => {
            // 更新globalData.classes
            const newClasses = JSON.parse(JSON.stringify(app.globalData.classes))
            const menberIdx = e.currentTarget.dataset.idx
            newClasses[this.idx].menberList.splice(menberIdx, 1)
            newClasses[this.idx].leftNum++ // 名额+1
            app.setGlobalData('classes', newClasses)
      
            // 更新globalData.signedUpClasses
            new Promise(resolve => {
              if (app.globalData.signedUpClasses) { // 如果内存里有signedUpClasses则更新globalData.signedUpClasses
                const newSignedUpClasses = JSON.parse(JSON.stringify(app.globalData.signedUpClasses))
                let signedUpClassIdx = -1
                newSignedUpClasses.some((classItem, idx) => {
                  if (classItem.classItem._id === this.data.class._id && classItem.name === name) {
                    signedUpClassIdx = idx
                    return true
                  }
                  return false
                })
                newSignedUpClasses.splice(signedUpClassIdx, 1)
                app.setGlobalData('signedUpClasses', newSignedUpClasses)
                resolve()
              } else { // 内存里没有则强制获取一次，获取后会自动更新到内存和缓存里
                app.getGlobalData({
                  keys: [{
                    key: 'signedUpClasses',
                    forceUpdate: true
                  }],
                  success: resolve
                })
              }
            }).then(() => {
              // 更新页面数据
              const newClass = this.data.class
              newClass.menberList.splice(menberIdx, 1)
              newClass.leftNum++ // 名额+1
      
              this.setData({
                class: newClass
              }, () => hideLoadingAndShowSucToast('删除成功'))
            })
          })
        }
      }
    })
  },

  init(forceUpdate, cb) {
    app.getGlobalData({
      keys: [{
        key: 'classes',
        forceUpdate
      }, {
        key: 'userInfo'
      }],
      showLoading() {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
      },
      success: () => {
        this.idx = getClassIdx(app.globalData.classes, this.options.id)
        const classItem = app.globalData.classes[this.idx]
        this.setData({
          loading: false,
          class: classItem
        }, () => {
          wx.hideLoading()
          typeof cb === 'function' && cb()
        })
      }
    })
  },
  onLoad(e) {
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