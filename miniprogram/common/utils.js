export function setStorage(key, data) {
  wx.setStorage({
    key,
    data: {
      data,
      time: new Date() * 1
    }
  })
}