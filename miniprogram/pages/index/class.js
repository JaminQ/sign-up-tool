const app = getApp()

Page({
  data: {
    loading: true,
    classes: []
  },

  init(forceUpdate, cb) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    app.getData(['openid', 'classes'], () => {
      this.setData({
        loading: false,
        classes: app.globalData.classes
      }, () => {
        wx.hideLoading()
        typeof cb === 'function' && cb()
      })
    })
  },
  onLoad() {
    this.init()
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  onPullDownRefresh() {
    this.init(true, wx.stopPullDownRefresh)
  },
  onShareAppMessage(res) {
    return {
      title: '罗老师艺术工作室',
      path: '/pages/index/home?share=1',
      imageUrl: '../../image/share.jpg'
    }
  }
})