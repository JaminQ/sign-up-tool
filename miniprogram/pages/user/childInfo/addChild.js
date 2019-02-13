const app = getApp()

Page({
  data: {
    idx: null,
    name: ''
  },
  nameChange(e) {
    this.setData({
      name: e.detail.value
    })
  },
  getName() {
    return this.data.name.trim()
  },
  validName(name) {
    if (name === '') {
      this.setData({
        name
      }, () => {
        wx.showToast({
          title: '请输入孩子真实姓名',
          icon: 'none',
          duration: 2000
        })
      })
      return false
    }
    return true
  },
  afterAjax(res, name) {
    const mode = this.data.idx === null ? 'add' : 'edit'
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]

    const newChildInfo = JSON.parse(JSON.stringify(prevPage.data.childInfo))
    if (mode === 'add') {
      newChildInfo.push(name)
    } else {
      newChildInfo[this.data.idx] = name
    }
    prevPage.setData({
      childInfo: newChildInfo
    }, () => {
      const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
      newUserInfo.childInfo = newChildInfo
      app.setGlobalData('userInfo', newUserInfo)

      wx.hideLoading({
        success() {
          wx.showToast({
            title: `${mode === 'add' ? '添加' : '更新'}成功`,
            duration: 60000
          })
          setTimeout(() => {
            wx.hideToast({
              success() {
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          }, 500)
        }
      })
    })
  },
  addChild() {
    const name = this.getName()
    if (this.validName(name)) {
      wx.showLoading({
        title: '添加中'
      })

      const db = wx.cloud.database()
      const _ = db.command

      db.collection('user').doc(app.globalData.userInfo._id).update({
        data: {
          childInfo: _.push([name])
        }
      }).then(res => this.afterAjax(res, name))
    }
  },
  updateChild() {
    const name = this.getName()
    if (this.validName(name)) {
      wx.showLoading({
        title: '更新中'
      })

      const db = wx.cloud.database()
      const _ = db.command

      const newChildInfo = JSON.parse(JSON.stringify(app.globalData.userInfo.childInfo))
      newChildInfo[this.data.idx] = name
      db.collection('user').doc(app.globalData.userInfo._id).update({
        data: {
          childInfo: _.set(newChildInfo)
        }
      }).then(res => this.afterAjax(res, name))
    }
  },
  initData(e) {
    if (e.idx !== undefined) { // 编辑模式
      const idx = e.idx * 1
      this.setData({
        idx,
        name: app.globalData.userInfo.childInfo[idx]
      })
    }
  },
  onLoad(e) {
    if (app.globalData.userInfo === null) {
      app.getUserInfo(() => this.initData(e))
    } else {
      this.initData(e)
    }
  }
})