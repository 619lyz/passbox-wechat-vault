Page({
  data: {
    version: 'v1.0.0',
    github: 'https://github.com/619lyz'
  },

  copyGithub() {
    wx.setClipboardData({
      data: this.data.github,
      success() {
        wx.showToast({
          title: '已复制',
          icon: 'success'
        })
      }
    })
  }
})
