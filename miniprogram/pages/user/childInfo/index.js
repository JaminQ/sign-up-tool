const app = getApp()

Page({
  data: {
    _id: '',
    childInfo: []
  },
  initData(cb) {
    const userInfo = app.globalData.userInfo
    this.setData({
      _id: userInfo._id,
      childInfo: userInfo.childInfo
    }, () => {
      typeof cb === 'function' && cb()
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