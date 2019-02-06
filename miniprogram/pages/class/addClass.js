const app = getApp()
const db = wx.cloud.database()
const classesCollection = db.collection('classes')
const { classType } = require('../../data/class-type.js')

Page({
  data: {
    mode: 'add',
    typeList: classType,
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
      wx.cloud.callFunction({
        name: 'addClass',
        data: formValue
      }).then(res => {
        console.log(res)

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

        // const newClasses = JSON.parse(JSON.stringify(this.data.classes))
        // newClasses.push({
        //   name: formValue.name,
        //   _id: res.result._id
        // })
      })
    }
  },
  editClass() {
    const formValue = this.getFormValue(this.data.formValue)

    if (this.validFormValue(formValue)) {
      classesCollection.doc(this._id).update({
        data: formValue,
        success(res) {
          console.log(res)
        },
        fail(res) {
          console.log(res)
        }
      })
    }
  },
  getFormValue(formValue) {
    formValue = JSON.parse(JSON.stringify(formValue))

    formValue.name = formValue.name.trim()
    formValue.type = this.data.typeList[formValue.typeIdx].name
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
  initEditForm(e) {
    const formValue = JSON.parse(JSON.stringify(app.globalData.classes[e.idx * 1]))
    this._id = formValue._id
    this.data.typeList.forEach((val, idx) => {
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
  onLoad(e) {
    if (e.idx !== undefined) { // 表示编辑
      if (app.globalData.classes === null) {
        app.getClasses(() => this.initEditForm(e))
      } else {
        this.initEditForm(e)
      }
    }
    // db.collection('class-type').get({
    //   success: res => {
    //     console.log(res);
    //     this.setData({
    //       typeList: res.data
    //     })
    //   }
    // })
  }
})