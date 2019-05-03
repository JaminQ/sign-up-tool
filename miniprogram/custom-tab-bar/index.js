Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/index/class",
      iconPath: "/image/class.png",
      selectedIconPath: "/image/class-hl.png",
      text: "课程"
    }, {
      pagePath: "/pages/user/index",
      iconPath: "/image/user.png",
      selectedIconPath: "/image/user-hl.png",
      text: "我的"
    }]
  },
  attached() {},
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  }
})