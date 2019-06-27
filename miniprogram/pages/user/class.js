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
    data[e.target.dataset.key] = e.detail.value * 1
    data.classes = this.filterData(data.classTypeIdx, data.childInfoIdx)
    this.setData(data)
  },
  filterData(classTypeIdx = this.data.classTypeIdx, childInfoIdx = this.data.childInfoIdx) {
    if (this.data.classType.length) {
      const newClasses = []
      const classTypeVal = this.data.classType[classTypeIdx]
      const childInfoVal = this.data.childInfo[childInfoIdx]
      app.globalData.signedUpClasses.forEach(item => {
        let menberExist = false
        for (let menberI = 0, menberLen = item.menberList.length; menberI < menberLen; menberI++) {
          if (childInfoIdx === 0 || item.menberList[menberI].name === childInfoVal) {
            menberExist = true
            break
          }
        }
        if ((classTypeIdx === 0 || item.type === classTypeVal) && menberExist) {
          newClasses.push(item)
        }
      })
      return newClasses
    }
    return app.globalData.signedUpClasses
  },

  viewDetail() {
    console.log('detail')
  },

  showLoading() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
  },
  init(forceUpdate, cb) {
    const getClassType = () => {
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
            classes: this.filterData(),
            openid: globalData.openid
          }, () => {
            wx.hideLoading()
            typeof cb === 'function' && cb()
          })
        }

        if (forceUpdate || app.globalData.signedUpClasses === null) {
          this.showLoading()
          app.getSignedUpClasses(render, forceUpdate)
        } else {
          render()
        }
      }

      if (forceUpdate || app.globalData.classType === null) {
        this.showLoading()
        app.getClassType(getSignedUpClasses, forceUpdate)
      } else {
        getSignedUpClasses()
      }
    }

    if (forceUpdate || app.globalData.openid === null) {
      this.showLoading()
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