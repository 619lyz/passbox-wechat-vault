const accountStore = require('../../utils/accounts')

Page({
  data: {
    accounts: [],
    selecting: false,
    selectedIds: [],
    deleting: false
  },

  onShow() {
    this.setData({
      accounts: this.decorateAccounts(accountStore.getAccounts())
    })
  },

  decorateAccounts(accounts, selectedIds = this.data.selectedIds) {
    const selectedMap = selectedIds.reduce((map, id) => {
      map[id] = true
      return map
    }, {})
    return accounts.map(account => ({
      ...account,
      selected: !!selectedMap[account.id]
    }))
  },

  goCreate() {
    wx.navigateTo({
      url: '/pages/account/account?mode=create'
    })
  },

  goTrust() {
    wx.navigateTo({
      url: '/pages/trust/trust'
    })
  },

  startSelecting() {
    if (this.data.selecting) return
    console.log('[Passbox] start selecting')
    const nextSelectedIds = []
    this.setData({
      selecting: true,
      selectedIds: nextSelectedIds,
      accounts: this.decorateAccounts(this.data.accounts, nextSelectedIds)
    })
    wx.showToast({
      title: '选择账号',
      icon: 'none'
    })
  },

  cancelSelecting() {
    if (!this.data.selecting) return
    console.log('[Passbox] cancel selecting')
    const nextSelectedIds = []
    this.setData({
      selecting: false,
      selectedIds: nextSelectedIds,
      accounts: this.decorateAccounts(this.data.accounts, nextSelectedIds)
    })
    wx.showToast({
      title: '已取消',
      icon: 'none'
    })
  },

  toggleSelect(e) {
    if (!this.data.selecting) return
    const { id } = e.currentTarget.dataset
    const selectedIds = this.data.selectedIds
    const selected = selectedIds.includes(id)

    const nextSelectedIds = selected
      ? selectedIds.filter(item => item !== id)
      : selectedIds.concat(id)

    this.setData({
      selectedIds: nextSelectedIds,
      accounts: this.decorateAccounts(this.data.accounts, nextSelectedIds)
    })
  },

  deleteSelected() {
    if (this.data.deleting) return
    const count = this.data.selectedIds.length
    if (!count) {
      wx.showToast({
        title: '请选择账号',
        icon: 'none'
      })
      return
    }

    this.setData({ deleting: true })
    wx.showModal({
      title: '删除账号',
      content: `确定删除选中的 ${count} 个账号吗？`,
      confirmText: '删除',
      confirmColor: '#d93025',
      success: res => {
        if (!res.confirm) return
        accountStore.deleteAccounts(this.data.selectedIds)
        this.setData({
          selectedIds: [],
          selecting: false
        })
        this.setData({
          accounts: this.decorateAccounts(accountStore.getAccounts())
        })
        wx.showToast({
          title: '已删除',
          icon: 'success'
        })
      },
      complete: () => {
        this.setData({ deleting: false })
      }
    })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    if (this.data.selecting) {
      this.toggleSelect(e)
      return
    }
    wx.navigateTo({
      url: `/pages/account/account?id=${id}`
    })
  }
})
