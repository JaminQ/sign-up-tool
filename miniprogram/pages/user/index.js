const app = getApp()

Page({
  data: {
    isManager: false
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  onLoad() {
    const isManager = () => {
      const managerList = ['op0Ga5SBv7L-WplYadTXdHH9k0vM', 'op0Ga5e1bCfwp44jLmE4I35KAnKg', 'op0Ga5RNo4x4BObCHj0mGCV89wbQ']
      if (managerList.indexOf(app.globalData.openid) > -1) {
        this.setData({
          isManager: true
        })
      }
    }

    if (app.globalData.openid === null) {
      app.getOpenid(isManager)
    } else {
      isManager()
    }
  }
})