const app = getApp()

Page({
  data: {
    classes: []
  },
  addClass() {
    wx.navigateTo({
      url: 'addClass'
    })
  },
  editClass(e) {
    wx.navigateTo({
      url: `addClass?idx=${e.target.dataset.idx}`
    })
  },
  delClass(e) {
    const classItem = this.data.classes[e.target.dataset.idx * 1]
    wx.showModal({
      title: '确定删除吗',
      content: `课程名：${classItem.name}`,
      confirmText: '删除',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          console.log('del')
        } else {
          console.log('cancel')
        }
      }
    });
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
  initClasses() {
    this.setData({
      classes: app.globalData.classes
    })
  },
  onLoad() {
    if (app.globalData.classes === null) {
      app.getClasses(this.initClasses)
    } else {
      this.initClasses(e)
    }
  }
})