const app = getApp()

Page({
  data: {
    classes: []
  },
  initClasses(cb) {
    this.setData({
      classes: app.globalData.signedUpClasses
    }, () => {
      typeof cb === 'function' && cb()
    })
  },
  onLoad() {
    if (app.globalData.signedUpClasses === null) {
      app.getSignedUpClasses(this.initClasses)
    } else {
      this.initClasses()
    }
  },
  onPullDownRefresh() {
    this.initClasses(wx.stopPullDownRefresh)
  }
})