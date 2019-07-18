import {
  alert,
  showNoneToast,
  hideLoadingAndBack
} from '../../../common/utils'

const app = getApp()

Page({
  data: {
    loading: true,
    mode: 'add', // add, edit
    name: ''
  },

  addChild() {
    const name = this.getName()

    if (this.validName(name)) {
      this.getDoc(name, (childInfo, doc, _) => {
        childInfo.push(name)
        doc.update({
          data: {
            childInfo: _.push([name])
          }
        }).then(res => {
          this.updateChildInfo(childInfo)
          hideLoadingAndBack('添加成功')
        })
      })
    }
  },
  updateChild() {
    const name = this.getName()

    if (this.validName(name)) {
      this.getDoc(name, (childInfo, doc, _) => {
        childInfo[childInfo.indexOf(this.options.name)] = name
        doc.update({
          data: {
            childInfo: _.set(childInfo)
          }
        }).then(res => {
          this.updateChildInfo(childInfo)
          hideLoadingAndBack('更新成功')
        })
      })
    }
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
        showNoneToast('请输入学员真实姓名')
      })
      return false
    }
    return true
  },
  getDoc(name, cb) {
    if (this.data.mode === 'edit' && this.options.name === name) { // 编辑模式时值没变化，直接结束
      wx.navigateBack({
        delta: 1
      })
    } else {
      wx.showLoading({
        title: `${this.data.mode === 'add' ? '添加' : '更新'}中`
      })

      const db = wx.cloud.database()
      const doc = db.collection('user').doc(app.globalData.userInfo._id)
      doc.get().then(res => {
        if (res.data.childInfo.indexOf(name) > -1) { // 查重
          this.updateChildInfo(res.data.childInfo)
          wx.hideLoading({
            success() {
              alert(`“${name}”该学员已存在`)
            }
          })
        } else {
          typeof cb === 'function' && cb(res.data.childInfo, doc, db.command)
        }
      })
    }
  },

  updateChildInfo(childInfo) {
    // 更新globalData.userInfo
    const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
    newUserInfo.childInfo = childInfo
    app.setGlobalData('userInfo', newUserInfo)
  },

  init() {
    app.getGlobalData({
      keys: ['userInfo'],
      success: () => {
        const name = this.options.name
        if (name !== undefined) { // 编辑模式
          this.setData({
            loading: false,
            mode: 'edit',
            name
          }, wx.hideLoading)
        } else {
          this.setData({
            loading: false
          }, wx.hideLoading)
        }
      }
    })
  },
  onLoad() {
    this.init()
  }
})