import {
  alert,
  getClass
} from '../../common/utils'

const app = getApp()

Page({
  data: {
    loading: true,
    class: {},
    xList: []
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
          alert('最近忙，晚点再弄，记得提醒我')

          // wx.showLoading({
          //   title: '删除中',
          //   mask: true
          // })

          // const db = wx.cloud.database()
          // const doc = db.collection('user').doc(app.globalData.userInfo._id)
          // const _ = db.command

          // doc.get().then(res => {
          //   const childInfo = res.data.childInfo
          //   childInfo.splice(childInfo.indexOf(name), 1)
          //   doc.update({
          //     data: {
          //       childInfo: _.set(childInfo)
          //     }
          //   }).then(res => {
          //     this.setData({
          //       childInfo
          //     }, () => {
          //       const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
          //       newUserInfo.childInfo = childInfo
          //       app.setGlobalData('userInfo', newUserInfo)

          //       hideLoadingAndShowSucToast('删除成功')
          //     })
          //   })
          // })
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
        const classItem = getClass(app.globalData.classes, this.options.id)
        this.setData({
          loading: false,
          class: classItem,
          xList: classItem.menberList.map(item => 0)
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