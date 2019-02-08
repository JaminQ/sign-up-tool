const app = getApp()

Page({
  data: {
    class: {},
    spaceLeft: ''
  },
  exportData() {
    console.log('export')
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
  }
})