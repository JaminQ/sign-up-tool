const app = getApp()

Page({
  data: {
    name: '',
    tel: '',
    wxAlias: ''
  },
  initData() {
    const userInfo = app.globalData.userInfo
    this.setData({
      name: userInfo.name || '',
      tel: userInfo.tel || '',
      wxAlias: userInfo.wxAlias || ''
    })
  },
  onLoad() {
    if (app.globalData.userInfo === null) {
      app.getUserInfo(this.initData)
    } else {
      this.initData()
    }
  }
})