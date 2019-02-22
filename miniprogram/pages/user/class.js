const app = getApp()

Page({
  data: {
    loading: true,

    classType: [],
    classTypeIdx: 0,
    childInfo: [],
    childInfoIdx: 0,

    classes: [],
    openid: ''
  },

  pickerChange(e) {
    const data = {}
    data[e.target.dataset.key] = e.detail.value
    this.setData(data)
  },

  init(forceUpdate, cb) {
    const getClassType = () => {
      const getUserInfo = () => {
        const getSignedUpClasses = () => {
          const render = () => {
            const globalData = app.globalData
            const classType = globalData.classType.map(val => val.name)
            classType.unshift('全部')
            const childInfo = JSON.parse(JSON.stringify(globalData.userInfo.childInfo))
            childInfo.unshift('全部')
            this.setData({
              loading: false,
              classType,
              childInfo,
              classes: globalData.signedUpClasses,
              openid: globalData.openid
            }, () => {
              wx.hideLoading()
              typeof cb === 'function' && cb()
            })
          }

          if (forceUpdate || app.globalData.signedUpClasses === null) {
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            app.getSignedUpClasses(render, forceUpdate)
          } else {
            render()
          }
        }

        if (forceUpdate || app.globalData.userInfo === null) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          app.getUserInfo(getSignedUpClasses, forceUpdate)
        } else {
          getSignedUpClasses()
        }
      }

      if (forceUpdate || app.globalData.classType === null) {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        app.getClassType(getUserInfo, forceUpdate)
      } else {
        getUserInfo()
      }
    }

    if (forceUpdate || app.globalData.openid === null) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      app.getOpenid(getClassType)
    } else {
      getClassType()
    }
  },
  onLoad() {
    this.init()
  },
  onPullDownRefresh() {
    this.init(true, wx.stopPullDownRefresh)
  }
})