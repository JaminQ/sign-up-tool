const app = getApp()

Page({
  data: {
    loading: true,
    classes: []
  },

  init(forceUpdate, cb) {
    const render = () => {
      this.setData({
        loading: false,
        classes: app.globalData.signedUpClasses
      }, () => {
        wx.hideLoading()
        typeof cb === 'function' && cb()
      })
    }

    if (forceUpdate || app.globalData.signedUpClasses === null) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      app.getSignedUpClasses(render, forceUpdate)
    } else {
      render()
    }
  },
  onLoad() {
    this.init()
  },
  onPullDownRefresh() {
    this.init(true, wx.stopPullDownRefresh)
  }
})