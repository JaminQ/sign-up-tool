const app = getApp()

Page({
  data: {
    classes: []
  },
  viewDetail(e) {
    wx.navigateTo({
      url: `classDetail?idx=${e.currentTarget.dataset.idx}`,
    })
  },
  initClasses(cb) {
    this.setData({
      classes: app.globalData.classes
    }, () => {
      typeof cb === 'function' && cb()
    })
  },
  onLoad() {
    if (app.globalData.classes === null) {
      app.getClasses(this.initClasses)
    } else {
      this.initClasses()
    }
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  onPullDownRefresh() {
    app.getClasses(() => {
      this.initClasses(wx.stopPullDownRefresh)
    })
  }
})