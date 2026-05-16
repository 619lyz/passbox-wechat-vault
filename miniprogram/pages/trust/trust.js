const accountStore = require('../../utils/accounts')

Page({
  data: {
    accountCount: 0,
    lastUpdatedText: '暂无记录',
    lastSyncText: '尚未同步',
    lastSyncError: ''
  },

  onShow() {
    const accounts = accountStore.getAccounts()
    const lastUpdated = accounts.reduce((latest, account) => {
      return Math.max(latest, account.updatedAt || account.createdAt || 0)
    }, 0)

    this.setData({
      accountCount: accounts.length,
      lastUpdatedText: lastUpdated ? this.formatDate(lastUpdated) : '暂无记录',
      lastSyncText: this.getLastSyncText(),
      lastSyncError: this.getLastSyncError()
    })
  },

  getLastSyncText() {
    const timestamp = wx.getStorageSync('passbox_last_cloud_sync')
    return timestamp ? this.formatDate(timestamp) : '尚未同步'
  },

  getLastSyncError() {
    if (wx.getStorageSync('passbox_last_cloud_sync')) return ''
    const error = wx.getStorageSync('passbox_last_cloud_sync_error')
    if (!error) return ''
    return error.errMsg || ''
  },

  formatDate(timestamp) {
    const date = new Date(timestamp)
    const pad = value => `${value}`.padStart(2, '0')
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  },

  goAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  }
})
