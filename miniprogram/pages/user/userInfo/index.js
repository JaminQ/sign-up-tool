const app = getApp()

Page({
  data: {
    loading: true,
    name: '',
    tel: '',
    wxAlias: ''
  },

  init() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    app.getData(['userInfo'], () => {
      const userInfo = app.globalData.userInfo
      this.setData({
        loading: false,
        name: userInfo.name || '',
        tel: userInfo.tel || '',
        wxAlias: userInfo.wxAlias || ''
      }, wx.hideLoading)
    })
  },
  onLoad() {
    this.init()
  }
})