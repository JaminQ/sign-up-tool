App({
  globalData: {
    classes: null,
    classType: null,
    openId: null
  },
  getClasses(cb) {
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })

    const db = wx.cloud.database()
    const classesCollection = db.collection('classes')

    classesCollection.orderBy('createTime', 'desc').get({
      success: res => {
        this.setClasses(res.data)
        typeof cb === 'function' && cb()
        wx.hideLoading()
      }
    })

    // this.setClasses(require('data/classes.js').classes)
    // typeof cb === 'function' && cb()
  },
  setClasses(classes) {
    this.globalData.classes = classes
  },
  getClassType(cb) {
    wx.showLoading({
      title: '资源加载中',
      mask: true
    })

    const db = wx.cloud.database()
    const classTypeCollection = db.collection('class-type')

    classTypeCollection.get({
      success: res => {
        this.setClassType(res.data)
        typeof cb === 'function' && cb()
        wx.hideLoading()
      }
    })

    // this.setClassType(require('data/class-type.js').classType)
    // typeof cb === 'function' && cb()
  },
  setClassType(classType) {
    this.globalData.classType = classType
  },
  getOpenid(cb) {
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
      this.getOpenid()
    }
  }
})