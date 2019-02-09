const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    classes: []
  },
  initClasses(cb) {
    db.collection('user').where({
      _openid: app.globalData.openId
    }).get().then(res => {
      db.collection('classes').where({
        _id: _.or(res.data[0].classes.map(id => _.eq(id)))
      }).get().then(({ data }) => {
        this.setData({
          classes: data
        }, () => {
          wx.hideLoading()
          typeof cb === 'function' && cb()
        })
      })
    })
  },
  onLoad() {
    wx.showLoading({
      title: '资源加载中',
    })

    if (app.globalData.openId === null) {
      app.getOpenid(this.initClasses)
    } else {
      this.initClasses()
    }
  }
})