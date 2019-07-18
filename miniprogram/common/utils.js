function alert(content) {
  wx.showModal({
    content,
    showCancel: false
  })
}

function showSucToast(title) {
  wx.showToast({
    title,
    duration: 500
  })
}

function hideLoadingAndShowSucToast(title) {
  wx.hideLoading({
    success() {
      showSucToast(title)
    }
  })
}

function hideLoadingAndBack(title, delta = 1) {
  wx.hideLoading({
    success() {
      wx.showToast({
        title,
        duration: 60000
      })
      setTimeout(() => {
        wx.hideToast({
          success() {
            wx.navigateBack({
              delta
            })
          }
        })
      }, 500)
    }
  })
}

function showNoneToast(title) {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2000
  })
}

function getClass(classes, _id) {
  const newClasses = JSON.parse(JSON.stringify(classes))
  for (let i = 0, len = newClasses.length; i < len; i++) {
    if (newClasses[i]._id === _id) return newClasses[i]
  }
  return null
}

function getClassIdx(classes, _id) {
  for (let i = 0, len = classes.length; i < len; i++) {
    if (classes[i]._id === _id) return i
  }
  return -1
}

export {
  alert,

  showSucToast,
  hideLoadingAndShowSucToast,
  hideLoadingAndBack,
  showNoneToast,

  getClass,
  getClassIdx
}