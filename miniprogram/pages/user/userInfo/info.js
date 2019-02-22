import {
  showNoneToast,
  hideLoadingAndBack
} from '../../../common/utils'

const app = getApp()

Page({
  data: {
    loading: true,
    key: '',
    val: ''
  },

  valChange(e) {
    this.setData({
      val: e.detail.value
    })
  },
  valid(val) {
    if (this.data.key === 'tel' && val.length !== 11) {
      showNoneToast('请填写正确的手机号码')
      return false
    }
    return true
  },
  save() {
    const val = this.data.val.trim()

    if (this.valid(val)) {
      wx.showLoading({
        title: '保存中'
      })

      const data = {}
      data[this.data.key] = val
      wx.cloud.database().collection('user').doc(app.globalData.userInfo._id).update({
        data
      }).then(res => {
        const pages = getCurrentPages()
        pages[pages.length - 2].setData(data, () => {
          const newUserInfo = JSON.parse(JSON.stringify(app.globalData.userInfo))
          Object.assign(newUserInfo, data)
          app.setGlobalData('userInfo', newUserInfo)

          hideLoadingAndBack('保存成功')
        })
      })
    }
  },

  init() {
    const render = () => {
      const key = this.options.key
      this.setData({
        loading: false,
        key,
        val: app.globalData.userInfo[key]
      })
    }

    if (app.globalData.userInfo === null) {
      app.getUserInfo(render)
    } else {
      render()
    }
  },
  onLoad() {
    this.init()
  }
})