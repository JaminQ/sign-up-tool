const db = wx.cloud.database()
const classesCollection = db.collection('classes')

Page({
  data: {
    classes: []
  },
  addClass() {
    wx.navigateTo({
      url: 'addClass'
    })
  },
  emptyClass() {
    wx.cloud.callFunction({
      name: 'removeClass',
      data: {}
    }).then(res => {
      console.log(res.result.stats.removed)

      this.setData({
        classes: []
      }, () => {
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      })
    })
  },
  getOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  onLoad() {
    classesCollection.orderBy('createTime', 'desc').get({
      success: res => {
        console.log(res);
        this.setData({
          classes: res.data
        })
      }
    })
  }
})