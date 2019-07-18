import {
  hideLoadingAndShowSucToast
} from '../../../common/utils'

const app = getApp()

Page({
  data: {
    loading: true,
    from: 'profile', // profile: 表示从用户profile页进入  class: 表示从课程详情页（报名页）进入
    childInfo: []
  },

  removeChild(e) {
    const name = e.target.dataset.name
    wx.showModal({
      title: '确定删除吗',
      content: name,
      confirmText: '删除',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中',
            mask: true
          })

          const db = wx.cloud.database()
          const doc = db.collection('user').doc(app.globalData.userInfo._id)
          const _ = db.command

          doc.get().then(res => {
            const childInfo = res.data.childInfo
            childInfo.splice(childInfo.indexOf(name), 1)
            doc.update({
              data: {
                childInfo: _.set(childInfo)
              }
            }).then(res => {
              this.setData({
                childInfo
              }, () => {
                const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
                newUserInfo.childInfo = childInfo
                app.setGlobalData('userInfo', newUserInfo)

                hideLoadingAndShowSucToast('删除成功')
              })
            })
          })
        }
      }
    })
  },

  init(forceUpdate, cb) {
    app.getGlobalData({
      keys: [{
        key: 'userInfo',
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
          from: this.options.from,
          childInfo: app.globalData.userInfo.childInfo
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
      childInfo: app.globalData.userInfo.childInfo
    })
  },
  onPullDownRefresh() {
    this.init(true, wx.stopPullDownRefresh)
  }
})