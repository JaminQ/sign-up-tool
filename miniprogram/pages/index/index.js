const db = wx.cloud.database()
const classesCollection = db.collection('classes')

Page({
  data: {
    classes: []
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
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  }
})