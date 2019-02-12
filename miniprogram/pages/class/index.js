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
  removeClass(e) {
    const idx = e.target.dataset.idx * 1
    const classItem = this.data.classes[idx]
    wx.showModal({
      title: '确定删除吗',
      content: `课程名：${classItem.name}`,
      confirmText: '删除',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '课程删除中',
            mask: true
          })

          wx.cloud.callFunction({
            name: 'class',
            data: {
              type: 'remove',
              _id: classItem._id
            }
          }).then(res => {
            const newClasses = JSON.parse(JSON.stringify(this.data.classes))
            newClasses.splice(idx, 1)
            app.setClasses(newClasses)
            this.setData({
              classes: newClasses
            }, () => {
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
  initClasses(cb) {
    this.setData({
      classes: app.globalData.classes
    }, () => {
      typeof cb === 'function' && cb()
    })
  },
  onLoad() {
    if (app.globalData.classes === null) {
      app.getClasses(this.initClasses)
    } else {
      this.initClasses()
    }
  },
  onPullDownRefresh() {
    app.getClasses(() => {
      this.initClasses(wx.stopPullDownRefresh)
    })
  }
})