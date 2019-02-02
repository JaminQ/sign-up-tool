const db = wx.cloud.database()
const classesCollection = db.collection('classes')

Page({
  data: {
    classInputValue: '',
    classes: []
  },
  classInput(e) {
    this.setData({
      classInputValue: e.detail.value
    })
  },
  addClass() {
    const className = this.data.classInputValue.trim()
    if (className === '') {
      this.setData({
        classInputValue: className
      }, () => {
        wx.showToast({
          title: '请输入课程名',
          icon: 'none',
          duration: 2000
        })
      })
      return false
    }
    wx.cloud.callFunction({
      name: 'addClass',
      data: {
        name: className
      }
    }).then(res => {
      console.log(res)

      const newClasses = JSON.parse(JSON.stringify(this.data.classes))
      newClasses.push({
        name: className,
        _id: res.result._id
      })
      this.setData({
        classes: newClasses,
        classInputValue: ''
      })
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