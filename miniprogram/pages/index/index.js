const app = getApp()

Page({
  data: {
    classes: []
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
  },
  onShareAppMessage(res) {
    return {
      title: '罗老师艺术工作室',
      path: '/pages/index/index?share=1',
      imageUrl: '../../image/share.jpg'
    }
  }
})