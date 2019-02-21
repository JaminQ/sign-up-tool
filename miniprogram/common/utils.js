function setStorage(key, data) {
  wx.setStorage({
    key,
    data: {
      data,
      time: new Date() * 1
    }
  })
}

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

export {
  setStorage,

  alert,

  showSucToast,
  hideLoadingAndShowSucToast,
  hideLoadingAndBack,
  showNoneToast
}