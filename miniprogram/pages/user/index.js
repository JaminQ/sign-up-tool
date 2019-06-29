const app = getApp()

Page({
  data: {
    isManager: false
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  onLoad() {
    this.setData({
      isManager: app.globalData.isManager
    })
  }
})