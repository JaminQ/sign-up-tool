const app = getApp()

Page({
  data: {
    loading: true,
    name: '',
    tel: '',
    wxAlias: ''
  },

  init() {
    const render = () => {
      const userInfo = app.globalData.userInfo
      this.setData({
        loading: false,
        name: userInfo.name || '',
        tel: userInfo.tel || '',
        wxAlias: userInfo.wxAlias || ''
      }, wx.hideLoading)
    }

    if (app.globalData.userInfo === null) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      app.getUserInfo(render)
    } else {
      render()
    }
  },
  onLoad() {
    this.init()
  }
})