const db = wx.cloud.database()
const classesCollection = db.collection('classes')

Page({
  data: {
    nameInputValue: '',

    typeList: [],
    typeIdx: -1
  },
  nameInput(e) {
    this.setData({
      nameInputValue: e.detail.value
    })
  },
  bindTypeChange(e) {
    this.setData({
      typeIdx: e.detail.value
    })
  },
  addClass() {
    const className = this.data.nameInputValue.trim()
    if (className === '') {
      this.setData({
        nameInputValue: className
      }, () => {
        wx.showToast({
          title: '请输入课程名',
          icon: 'none',
          duration: 2000
        })
      })
      return false
    }
    wx.cloud.callFunction({
      name: 'addClass',
      data: {
        name: className
      }
    }).then(res => {
      console.log(res)

      const newClasses = JSON.parse(JSON.stringify(this.data.classes))
      newClasses.push({
        name: className,
        _id: res.result._id
      })
      this.setData({
        classes: newClasses,
        nameInputValue: ''
      })
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