const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    _id: '',
    childInfo: []
  },
  initChild(cb) {
    db.collection('user').where({
      _openid: app.globalData.openId
    }).get().then(res => {
      const data = res.data[0]
      this.setData({
        _id: data._id,
        childInfo: data.childInfo
      }, () => {
        wx.hideLoading()
        typeof cb === 'function' && cb()
      })
    })
  },
  onLoad() {
    wx.showLoading({
      title: '资源加载中'
    })

    if (app.globalData.openId === null) {
      app.getOpenid(this.initChild)
    } else {
      this.initChild()
    }
  }
})