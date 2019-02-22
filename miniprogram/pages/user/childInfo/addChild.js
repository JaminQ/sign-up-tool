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
        }).then(res => this.setPrevPageData(childInfo, () => {
          hideLoadingAndBack('添加成功')
        }))
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
        }).then(res => this.setPrevPageData(childInfo, () => {
          hideLoadingAndBack('更新成功')
        }))
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
        showNoneToast('请输入孩子真实姓名')
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
          this.setPrevPageData(res.data.childInfo, () => {
            wx.hideLoading({
              success() {
                alert(`“${name}”该孩子已存在`)
              }
            })
          })
        } else {
          typeof cb === 'function' && cb(res.data.childInfo, doc, db.command)
        }
      })
    }
  },
  setPrevPageData(childInfo, cb) {
    const pages = getCurrentPages()
    pages[pages.length - 2].setData({
      childInfo
    }, () => {
      const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
      newUserInfo.childInfo = childInfo
      app.setGlobalData('userInfo', newUserInfo)

      if (this.options.from === 'class') { // 如果是从课程详情页（报名页）进入孩子信息页的，则更新这个页面的childInfo
        pages[pages.length - 3].setData({
          childInfo
        }, cb)
      } else {
        typeof cb === 'function' && cb()
      }
    })
  },

  init() {
    const render = () => {
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

    if (app.globalData.userInfo === null) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      app.getUserInfo(render)
    } else {
      render()
    }
  },
  onLoad() {
    this.init()
  }
})