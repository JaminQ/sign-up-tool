Page({
  data: {},
  goClassManagePage() {
    wx.navigateTo({
      url: '../class/index'
    })
  },
  viewSignedUpClass() {
    wx.navigateTo({
      url: 'class'
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