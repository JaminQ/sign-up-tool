const app = getApp()

Page({
  data: {
    loading: true,
    classes: []
  },

  init(forceUpdate, cb) {
    app.getGlobalData({
      keys: ['openid', {
        key: 'classes',
        forceUpdate
      }],
      showLoading() {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
      },
      success: () => {
        this.setData({
          loading: false,
          classes: app.globalData.classes
        }, () => {
          wx.hideLoading()
          typeof cb === 'function' && cb()
        })
      }
    })
  },
  onLoad() {
    this.init()
  },
  onShow() {
    // 选中对应的tab
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }

    // 更新数据
    !this.data.loading && this.setData({
      classes: app.globalData.classes
    })
  },
  onPullDownRefresh() {
    this.init(true, wx.stopPullDownRefresh)
  },
  onShareAppMessage(res) {
    return {
      title: '罗老师艺术工作室',
      path: '/pages/index/home?share=1',
      imageUrl: '../../image/share.jpg'
    }
  }
})