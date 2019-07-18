import {
  hideLoadingAndShowSucToast
} from '../../common/utils'

const app = getApp()

Page({
  data: {
    loading: true,
    classes: []
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
            app.setGlobalData('classes', newClasses)
            this.setData({
              classes: newClasses
            }, () => {
              hideLoadingAndShowSucToast('删除成功')
            })
          })
        }
      }
    })
  },

  init(forceUpdate, cb) {
    app.getGlobalData({
      keys: [{
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
    // 更新数据
    !this.data.loading && this.setData({
      classes: app.globalData.classes
    })
  },
  onPullDownRefresh() {
    this.init(true, wx.stopPullDownRefresh)
  }
})