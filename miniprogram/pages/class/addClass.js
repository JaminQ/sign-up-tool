const app = getApp()

Page({
  data: {
    mode: 'add',
    classType: [],
    formValue: {
      name: '',
      typeIdx: 0,
      maxNum: '',
      studyTime: '',
      studyDuration: '',
      cycle: '',
      cost: ''
    },
    formError: {
      name: false,
      maxNum: false,
      studyTime: false,
      studyDuration: false,
      cycle: false,
      cost: false
    }
  },
  formItemChange(e) {
    const data = {}
    data[`formValue.${e.target.dataset.name}`] = e.detail.value
    this.setData(data)
  },
  addClass() {
    const formValue = this.getFormValue(this.data.formValue)

    if (this.validFormValue(formValue)) {
      wx.showLoading({
        title: '课程添加中',
        mask: true
      })

      // 调用server端添加课程
      wx.cloud.callFunction({
        name: 'class',
        data: {
          type: 'add',
          formValue
        }
      }).then(res => {
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        const newClasses = JSON.parse(JSON.stringify(prevPage.data.classes))
        formValue._id = res.result._id
        newClasses.unshift(formValue)
        app.setClasses(newClasses)
        prevPage.setData({
          classes: newClasses
        }, () => {
          wx.hideLoading({
            success() {
              wx.showToast({
                title: '添加成功',
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
      })
    }
  },
  editClass() {
    const formValue = this.getFormValue(this.data.formValue)

    if (this.validFormValue(formValue)) {
      wx.showLoading({
        title: '课程更新中',
        mask: true
      })

      wx.cloud.callFunction({
        name: 'class',
        data: {
          type: 'update',
          _id: this._id,
          formValue
        }
      }).then(res => {
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        const newClasses = JSON.parse(JSON.stringify(prevPage.data.classes))
        newClasses[this.idx] = formValue
        app.setClasses(newClasses)
        prevPage.setData({
          classes: newClasses
        }, () => {
          wx.hideLoading({
            success() {
              wx.showToast({
                title: '更新成功',
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
      })
    }
  },
  getFormValue(formValue) {
    formValue = JSON.parse(JSON.stringify(formValue))

    formValue.name = formValue.name.trim()
    formValue.type = this.data.classType[formValue.typeIdx].name
    delete formValue.typeIdx
    formValue.maxNum = formValue.maxNum * 1
    formValue.studyTime = formValue.studyTime.trim()
    formValue.studyDuration = formValue.studyDuration * 1
    formValue.cycle = formValue.cycle * 1
    formValue.cost = formValue.cost * 1

    return formValue
  },
  validFormValue(formValue) {
    let isValid = true
    const formError = {}

    if (formValue.name === '') {
      formError.name = true
      isValid = false
    }
    if (formValue.maxNum <= 0) {
      formError.maxNum = true
      isValid = false
    }
    if (formValue.studyTime === '') {
      formError.studyTime = true
      isValid = false
    }
    if (formValue.studyDuration <= 0) {
      formError.studyDuration = true
      isValid = false
    }
    if (formValue.cycle <= 0) {
      formError.cycle = true
      isValid = false
    }
    if (formValue.cost <= 0) {
      formError.cost = true
      isValid = false
    }

    if (!isValid) {
      const data = {
        formValue: this.data.formValue,
        formError
      }

      if (formError.name) data.formValue.name = formValue.name
      if (formError.studyTime) data.formValue.studyTime = formValue.studyTime

      this.setData(data, () => {
        wx.showToast({
          title: '请填写完整的信息',
          icon: 'none',
          duration: 2000
        })
      })
      return false
    }
    return true
  },
  initEditForm() {
    const formValue = JSON.parse(JSON.stringify(app.globalData.classes[this.idx * 1]))
    this._id = formValue._id
    this.data.classType.forEach((val, idx) => {
      if (val.name === formValue.type) {
        formValue.typeIdx = idx
      }
    })
    delete formValue._id
    delete formValue._openid
    delete formValue.createTime
    delete formValue.type
    this.setData({
      mode: 'edit',
      formValue
    })
  },
  initClassType() {
    this.setData({
      classType: app.globalData.classType
    }, () => {
      this.initMode()
    })
  },
  initMode() {
    if (this.idx !== undefined) { // 表示编辑
      if (app.globalData.classes === null) {
        app.getClasses(() => this.initEditForm())
      } else {
        this.initEditForm()
      }
    }
  },
  onLoad(e) {
    this.idx = e.idx

    if (app.globalData.classType === null) {
      app.getClassType(this.initClassType)
    } else {
      this.initClassType()
    }
  }
})