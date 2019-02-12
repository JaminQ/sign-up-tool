const db = wx.cloud.database()
const _ = db.command
const userCollection = db.collection('user')

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
    // app.setClasses(newChildInfo)
    prevPage.setData({
      childInfo: newChildInfo
    }, () => {
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

      userCollection.doc(this._id).update({
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

      const doc = userCollection.doc(this._id)
      doc.get().then(res => {
        const childInfo = res.data.childInfo
        childInfo[this.data.idx] = name

        doc.update({
          data: {
            childInfo: _.set(childInfo)
          }
        }).then(res => this.afterAjax(res, name))
      })
    }
  },
  onLoad(e) {
    this._id = e._id
    if (e.idx !== undefined && e.name !== undefined) { // 编辑模式
      this.setData({
        idx: e.idx,
        name: e.name
      })
    }
  }
})