const db = wx.cloud.database()
const classesCollection = db.collection('classes')

Page({
  data: {
    classes: []
  },
  addClass() {
    wx.cloud.callFunction({
      name: 'addClass',
      data: {}
    }).then(res => {
      console.log(res)
      const newClasses = JSON.parse(JSON.stringify(this.data.classes))
      newClasses.push({
        name: '毛笔',
        _id: res.result._id
      })
      this.setData({
        classes: newClasses
      })
    })
    // classesCollection.add({
    //   data: {
    //     name: '国画'
    //   },
    //   success: res => {
    //     console.log(res)
    //   },
    //   fail: res => {
    //     console.log(res)
    //   }
    // })
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
    classesCollection.get({
      success: res => {
        console.log(res);
        this.setData({
          classes: res.data
        })
      }
    })
  }
})