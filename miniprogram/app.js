const { classes } = require('data/classes.js')

App({
  globalData: {
    classes: null
  },
  getClasses(cb) {
    const db = wx.cloud.database()
    const classesCollection = db.collection('classes')

    classesCollection.orderBy('createTime', 'desc').get({
      success: res => {
        this.globalData.classes = res.data
        typeof cb === 'function' && cb()
      }
    })

    // this.globalData.classes = classes
    // typeof cb === 'function' && cb()
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true
      })
    }
  }
})