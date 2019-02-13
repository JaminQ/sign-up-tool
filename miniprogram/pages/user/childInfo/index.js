const app = getApp()

Page({
  data: {
    childInfo: []
  },
  removeChild(e) {
    const idx = e.target.dataset.idx * 1
    const name = this.data.childInfo[idx]
    wx.showModal({
      title: '确定删除吗',
      content: name,
      confirmText: '删除',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
            mask: true
          })

          const db = wx.cloud.database()
          const _ = db.command

          const newChildInfo = JSON.parse(JSON.stringify(this.data.childInfo))
          newChildInfo.splice(idx, 1)
          db.collection('user').doc(app.globalData.userInfo._id).update({
            data: {
              childInfo: _.set(newChildInfo)
            }
          }).then(res => {
            this.setData({
              childInfo: newChildInfo
            }, () => {
              const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
              newUserInfo.childInfo = newChildInfo
              app.setGlobalData('userInfo', newUserInfo)

              wx.hideLoading({
                success() {
                  wx.showToast({
                    title: '删除成功',
                    duration: 500
                  })
                }
              })
            })
          })
        }
      }
    });
  },
  initChildInfo(cb) {
    const userInfo = app.globalData.userInfo
    this.setData({
      childInfo: app.globalData.userInfo.childInfo
    }, () => {
      typeof cb === 'function' && cb()
    })
  },
  onLoad() {
    if (app.globalData.userInfo === null) {
      app.getUserInfo(this.initChildInfo)
    } else {
      this.initChildInfo()
    }
  }
})