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
        // 更新globalData.userInfo
        app.setGlobalData('userInfo', Object.assign(JSON.parse(JSON.stringify(app.globalData.userInfo)), data))

        hideLoadingAndBack('保存成功')
      })
    }
  },

  init() {
    app.getGlobalData({
      keys: ['userInfo'],
      success: () => {
        const key = this.options.key
        this.setData({
          loading: false,
          key,
          val: app.globalData.userInfo[key]
        })
      }
    })
  },
  onLoad() {
    this.init()
  }
})