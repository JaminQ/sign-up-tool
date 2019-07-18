const app = getApp()

Page({
  data: {
    loading: true,
    name: '',
    tel: '',
    wxAlias: ''
  },

  init() {
    app.getGlobalData({
      keys: ['userInfo'],
      showLoading() {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
      },
      success: () => {
        const userInfo = app.globalData.userInfo
        this.setData({
          loading: false,
          name: userInfo.name || '',
          tel: userInfo.tel || '',
          wxAlias: userInfo.wxAlias || ''
        }, wx.hideLoading)
      }
    })
  },
  onLoad() {
    this.init()
  }
})