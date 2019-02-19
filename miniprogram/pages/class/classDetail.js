const app = getApp()

Page({
  data: {
    class: {},
    spaceLeft: ''
  },
  exportData() {
    wx.showModal({
      content: '还没做哦~要不你请我吃饭，我给你加班做出来？',
      showCancel: false
    });
  },
  initClass() {
    const classItem = app.globalData.classes[this.idx]
    let spaceLeft = classItem.maxNum
    classItem.menberList.forEach((menber, menberIdx) => {
      if (menber !== null) spaceLeft--
    })
    this.setData({
      class: classItem,
      spaceLeft
    })
  },
  onLoad(e) {
    this.idx = e.idx * 1

    if (app.globalData.classes === null) {
      app.getClasses(this.initClass)
    } else {
      this.initClass()
    }
  },
  onShareAppMessage(res) {
    return {
      title: `“${this.data.class.name}”开始报名啦~`,
      path: `/pages/index/classDetail?id=${this.data.class._id}&share=1`,
      imageUrl: '../../image/share.jpg'
    }
  }
})