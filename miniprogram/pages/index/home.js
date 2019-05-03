Page({
  onShareAppMessage(res) {
    return {
      title: '罗老师艺术工作室',
      path: '/pages/index/home?share=1',
      imageUrl: '../../image/share.jpg'
    }
  }
})