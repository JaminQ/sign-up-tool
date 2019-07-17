import {
  alert,
  getClass
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

  init(forceUpdate, cb) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    app.getGlobalData([{
      key: 'classes',
      forceUpdate
    }], () => {
      this.setData({
        loading: false,
        class: getClass(app.globalData.classes, this.options.id)
      }, () => {
        wx.hideLoading()
        typeof cb === 'function' && cb()
      })
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