Page({
  data: {
  },
  goClassManagePage() {
    wx.navigateTo({
      url: '../class/index'
    })
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  }
})