// 空函数
export function noop() { }

// // 处理时间，统一转为13位时间戳
// function parseDate(date) {
//   if (typeof date === 'object' && date instanceof Date) { // Date对象
//     return date * 1
//   } else { // 字符串或数字，兼容10位和13位时间戳
//     return date.toString().length === 10 ? date * 1000 : date * 1
//   }
// }

// // 格式化时间
// export function formatDate(date = new Date(), formatStr = 'YYYY/MM/DD hh:mm:ss') {
//   // 不足两位数的补0
//   const fix = num => (num < 10 ? '0' : '') + num

//   // 处理时间
//   date = new Date(parseDate(date))

//   const year = date.getFullYear()
//   const month = date.getMonth() + 1
//   const day = date.getDate()
//   const hour = date.getHours()
//   const minute = date.getMinutes()
//   const second = date.getSeconds()

//   return formatStr.replace(/YYYY/g, year)
//     .replace(/YY/g, year % 100)
//     .replace(/MM/g, fix(month))
//     .replace(/M/g, month)
//     .replace(/DD/g, fix(day))
//     .replace(/D/g, day)
//     .replace(/hh/g, fix(hour))
//     .replace(/h/g, hour)
//     .replace(/mm/g, fix(minute))
//     .replace(/m/g, minute)
//     .replace(/ss/g, fix(second))
//     .replace(/s/g, second)
// }

// // 格式化时间（几秒前，几分钟前，几小时前，几天前）
// export function formatTimeline(now, date) {
//   // 处理时间
//   now = parseDate(now)
//   date = parseDate(date)

//   // 计算差值
//   const delta = (now - date) / 1000

//   if (delta < 60) { // 1分钟内，显示几秒前
//     return `${Math.floor(delta) || 1}秒前`
//   } else if (delta < 3600) { // 1小时内，显示几分钟前
//     return `${Math.floor(delta / 60) || 1}分钟前`
//   } else if (delta < 86400) { // 1天内，显示几小时前
//     return `${Math.floor(delta / 3600) || 1}小时前`
//   } else { // 1天或1天以上，显示几天前
//     return `${Math.floor(delta / 86400) || 1}天前`
//   }
// }

// 显示/隐藏loading
export function loading(msg = '加载中', callback) {
  // 处理只有callback参数的情况
  if (arguments.length === 1 && typeof msg === 'function') {
    callback = msg
    msg = '加载中'
  }

  if (msg) {
    wx.showLoading({
      title: msg,
      mask: true,
      success: callback
    })
  } else {
    wx.hideLoading({
      success: callback
    })
  }
}

// 显示成功toast
export function success(opt = {
  title: '已完成'
}, callback) {
  // 处理只有callback参数的情况
  if (arguments.length === 1 && typeof opt === 'function') {
    callback = opt
    opt = '已完成'
  }

  // 如果opt是字符串，处理成对象
  if (typeof opt === 'string') {
    opt = {
      title: opt
    }
  }

  loading(false, () => wx.showToast({
    title: opt.title,
    icon: 'success',
    image: opt.image || '',
    duration: opt.duration || 750,
    mask: opt.mask === undefined ? true : opt.mask,
    success: opt.success || callback || noop,
    fail: opt.fail || noop,
    complete: opt.complete || noop
  }))
}

// 弹窗
export function alert(opt = {}, callback) {
  // 处理只有callback参数的情况
  if (arguments.length === 1 && typeof opt === 'function') {
    callback = opt
    opt = {}
  }

  // 如果opt是字符串，处理成对象
  if (typeof opt === 'string') {
    opt = {
      content: opt
    }
  }

  wx.showModal({
    title: opt.title || '错误',
    content: opt.content || '系统错误，请稍后重试',
    showCancel: false,
    confirmText: opt.confirmText || '确定',
    confirmColor: opt.confirmColor || '#3CC51F',
    success: opt.success || callback || noop,
    fail: opt.fail || noop,
    complete: opt.complete || noop
  })
}

// 对话框
export function dialog(opt = {}, confirm, cancel) {
  // 处理没有opt参数的情况
  if (arguments.length < 3 && typeof opt === 'function') {
    cancel = confirm
    confirm = opt
    opt = {}
  }

  // 如果opt是字符串，处理成对象
  if (typeof opt === 'string') {
    opt = {
      content: opt
    }
  }

  // 处理confirm和cancel回调
  let callback = noop
  if (typeof confirm === 'function' || typeof cancel === 'function') {
    callback = res => {
      if (res.confirm) {
        typeof confirm === 'function' && confirm(res)
      } else if (res.cancel) {
        typeof cancel === 'function' && cancel(res)
      }
    }
  }

  wx.showModal({
    title: opt.title || '提示',
    content: opt.content || '确定吗？',
    showCancel: true,
    cancelText: opt.cancelText || '取消',
    cancelColor: opt.cancelColor || '#000000',
    confirmText: opt.confirmText || '确定',
    confirmColor: opt.confirmColor || '#3CC51F',
    success: opt.success || callback || noop,
    fail: opt.fail || noop,
    complete: opt.complete || noop
  })
}

// 序列化
export function serialize(obj) {
  return Object.keys(obj).map(key => `${key}=${encodeURIComponent(typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : obj[key])}`).join('&')
}

// 跳转
export function go(url, data, success, fail, complete) {
  wx.navigateTo({
    url: url + (data ? `?${serialize(data)}` : ''),
    success,
    fail,
    complete
  })
}

// 跳转（关闭所有页面）
export function reLaunch(url, data, success, fail, complete) {
  wx.reLaunch({
    url: url + (data ? `?${serialize(data)}` : ''),
    success,
    fail,
    complete
  })
}

// 返回
export function back(delta, success, fail, complete) {
  wx.navigateBack({
    delta,
    success,
    fail,
    complete
  })
}