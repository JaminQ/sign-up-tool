const db = wx.cloud.database()
const classesCollection = db.collection('classes')

Page({
  data: {
    typeList: [],

    formValue: {
      name: '',
      typeIdx: 0,
      maxNum: '',
      studyTime: '',
      studyDuration: '',
      cycle: '',
      cost: ''
    }
  },
  formItemChange(e) {
    const data = {}
    data[`formValue.${e.target.dataset.name}`] = e.detail.value
    this.setData(data)
  },
  addClass() {
    const formValue = this.data.formValue

    // init data
    formValue.name = formValue.name.trim()
    formValue.type = this.data.typeList[formValue.typeIdx].name
    delete formValue.typeIdx
    formValue.maxNum = formValue.maxNum * 1
    formValue.studyTime = formValue.studyTime.trim()
    formValue.studyDuration = formValue.studyDuration * 1
    formValue.cycle = formValue.cycle * 1
    formValue.cost = formValue.cost * 1

    // valid
    if (formValue.name === '') {
      this.setData({
        'formValue.name': formValue.name
      }, () => {
        wx.showToast({
          title: '请输入课程名',
          icon: 'none',
          duration: 2000
        })
      })
      return false
    }

    // ajax
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
  },
  onLoad() {
    db.collection('class-type').get({
      success: res => {
        console.log(res);
        this.setData({
          typeList: res.data
        })
      }
    })
  }
})