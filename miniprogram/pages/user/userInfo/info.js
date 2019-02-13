const app = getApp()

Page({
  data: {
    key: '',
    val: ''
  },
  valChange(e) {
    this.setData({
      val: e.detail.value
    })
  },
  valid(val) {
    if (this.data.key === 'tel' && val.length !== 11) {
      wx.showToast({
        title: '请填写正确的手机号码',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    return true
  },
  save() {
    const val = this.data.val.trim()

    if (!this.valid(val)) return false

    wx.showLoading({
      title: '保存中'
    })

    const data = {}
    data[this.data.key] = val
    wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).update({
      data
    }).then(res => {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      prevPage.setData(data, () => {
        const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
        Object.assign(newUserInfo, data)
        app.setGlobalData('userInfo', newUserInfo)

        wx.hideLoading({
          success() {
            wx.showToast({
              title: '保存成功',
              duration: 60000
            })
            setTimeout(() => {
              wx.hideToast({
                success() {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              })
            }, 500)
          }
        })
      })
    })
  },
  initData(key) {
    this.setData({
      key,
      val: app.globalData.userInfo[key]
    })
  },
  onLoad(e) {
    if (app.globalData.userInfo === null) {
      app.getUserInfo(() => this.initData(e.key))
    } else {
      this.initData(e.key)
    }
  }
})