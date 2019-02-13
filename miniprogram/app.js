App({
  globalData: {
    classes: null,
    classType: null,
    userInfo: null,
    signedUpClasses: null,
    openId: null
  },
  getClasses(cb) {
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })

    wx.cloud.database().collection('classes').orderBy('createTime', 'desc').get({
      success: res => {
        this.setClasses(res.data)
        typeof cb === 'function' && cb()
        wx.hideLoading()
      }
    })
  },
  setClasses(classes) {
    this.globalData.classes = classes
  },
  getClassType(cb) {
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })

    wx.cloud.database().collection('class-type').get({
      success: res => {
        this.setClassType(res.data)
        typeof cb === 'function' && cb()
        wx.hideLoading()
      }
    })
  },
  setClassType(classType) {
    this.globalData.classType = classType
  },
  getUserInfo(cb) {
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })

    if (this.globalData.openId === null) {
      this.getOpenId(() => this.getUserInfo(cb))
    } else {
      wx.cloud.database().collection('user').where({
        _openid: this.globalData.openId
      }).get().then(res => {
        this.globalData.userInfo = res.data[0]
        typeof cb === 'function' && cb()
        wx.hideLoading()
      })
    }
  },
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
  },
  getSignedUpClasses(cb) {
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })

    if (this.globalData.userInfo === null) {
      this.getUserInfo(() => this.getSignedUpClasses(cb))
    } else {
      const db = wx.cloud.database()
      const _ = db.command

      db.collection('classes').where({
        _id: _.or(this.globalData.userInfo.classes.map(id => _.eq(id)))
      }).get().then(res => {
        this.globalData.signedUpClasses = res.data
        typeof cb === 'function' && cb()
        wx.hideLoading()
      })
    }
  },
  setSignedUpClasses(signedUpClasses) {
    this.globalData.signedUpClasses = signedUpClasses
  },
  getOpenId(cb) {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openId = res.result.openid
        typeof cb === 'function' && cb()
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true
      })
      // this.getOpenId()
    }
  }
})