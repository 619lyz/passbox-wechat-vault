App({
  onLaunch() {
    this.globalData = {
      env: 'cloudbase-d9guy5yz6e83d6098'
    }

    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true
      })
    }

    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  }
})
