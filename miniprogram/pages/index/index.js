const db = wx.cloud.database()
const classesCollection = db.collection('classes')

Page({
  data: {
    classInputValue: '',
    classes: []
  },
  onLoad() {
    classesCollection.get({
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