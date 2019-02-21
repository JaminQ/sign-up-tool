import {
  showNoneToast,
  hideLoadingAndBack
} from '../../common/utils'

const app = getApp()

Page({
  data: {
    mode: 'add', // add, edit
    classType: [],
    formValue: {
      name: '',
      typeIdx: 0,
      maxNum: '',
      cycle: '',
      cost: '',
      beginTime: '10:00',
      endTime: '11:00',
      studyDate: [false, false, false, false, false, false, false]
    },
    formError: {
      name: false,
      maxNum: false,
      cycle: false,
      cost: false,
      beginTime: false,
      studyDate: false
    }
  },
  formItemChange(e) {
    const data = {}
    data[`formValue.${e.target.dataset.name}`] = e.detail.value
    this.setData(data)
  },
  studyDateChange(e) {
    const studyDate = [false, false, false, false, false, false, false]

    e.detail.value.forEach(idx => {
      studyDate[idx * 1] = true
    })

    this.setData({
      'formValue.studyDate': studyDate
    })
  },
  addClass() {
    const formValue = this.getFormValue(this.data.formValue)

    if (this.validFormValue(formValue)) {
      wx.showLoading({
        title: '课程添加中',
        mask: true
      })

      wx.cloud.callFunction({
        name: 'class',
        data: {
          type: 'add',
          formValue
        }
      }).then(res => this.afterAjax(res, formValue))
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
      }).then(res => this.afterAjax(res, formValue))
    }
  },
  getFormValue(formValue) {
    formValue = JSON.parse(JSON.stringify(formValue))

    formValue.name = formValue.name.trim()
    formValue.type = this.data.classType[formValue.typeIdx].name
    delete formValue.typeIdx
    formValue.maxNum = formValue.maxNum * 1
    formValue.cycle = formValue.cycle * 1
    formValue.cost = formValue.cost * 1

    return formValue
  },
  validFormValue(formValue) {
    let isFull = true // 表单是否完整
    let isTimeCorrect = true // 时间是否正确
    const formError = {}

    if (formValue.name === '') {
      formError.name = true
      isFull = false
    }
    if (formValue.maxNum <= 0) {
      formError.maxNum = true
      isFull = false
    }
    if (formValue.cycle <= 0) {
      formError.cycle = true
      isFull = false
    }
    if (formValue.cost <= 0) {
      formError.cost = true
      isFull = false
    }
    formError.studyDate = false
    formValue.studyDate.forEach(val => {
      if (val) formError.studyDate = true
    })
    formError.studyDate = !formError.studyDate
    if (formError.studyDate) {
      isFull = false
    }

    const beginTime = formValue.beginTime.split(':').map(val => val * 1)
    const endTime = formValue.endTime.split(':').map(val => val * 1)
    if (beginTime[0] >= endTime[0] && beginTime[1] >= endTime[1]) {
      formError.beginTime = true
      isTimeCorrect = false
    }

    if (!isFull || !isTimeCorrect) {
      const data = {
        formValue: this.data.formValue,
        formError
      }

      if (formError.name) data.formValue.name = formValue.name

      const titleArr = []
      if (!isFull) titleArr.push('请填写完整的信息')
      if (!isTimeCorrect) titleArr.push('结束时间不能小于开始时间')
      this.setData(data, () => {
        showNoneToast(titleArr.join('，'))
      })
      return false
    }
    this.setData({
      formError
    })
    return true
  },
  afterAjax(res, formValue) {
    const mode = this.data.mode
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    const newClasses = JSON.parse(JSON.stringify(prevPage.data.classes))

    if (mode === 'add') {
      newClasses.unshift(res.result._data)
    } else {
      newClasses[this.idx] = formValue
    }
    app.setClasses(newClasses)
    prevPage.setData({
      classes: newClasses
    }, () => {
      hideLoadingAndBack(`${mode === 'add' ? '添加' : '更新'}成功`)
    })
  },
  initEditForm() {
    this.idx = this.idx * 1
    const formValue = JSON.parse(JSON.stringify(app.globalData.classes[this.idx]))
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