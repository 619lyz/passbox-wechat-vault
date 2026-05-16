const accountStore = require('../../utils/accounts')

const copyText = text => {
  if (!text) return
  wx.setClipboardData({
    data: text,
    success() {
      wx.showToast({
        title: '已复制',
        icon: 'success'
      })
    }
  })
}

Page({
  data: {
    id: '',
    mode: 'detail',
    account: null,
    form: {},
    presetLogos: accountStore.presetLogos,
    selectedLogoKey: 'wechat',
    showPassword: false,
    showFormPassword: false
  },

  onLoad(options) {
    if (options.mode === 'create') {
      const defaultLogo = accountStore.presetLogos[0]
      this.setData({
        mode: 'create',
        form: {
          platform: defaultLogo.name,
          username: '',
          password: '',
          note: '',
          logo: defaultLogo,
          customLogoPath: ''
        },
        selectedLogoKey: defaultLogo.key,
        showFormPassword: false
      })
      wx.setNavigationBarTitle({ title: '新增账号' })
      return
    }

    this.loadAccount(options.id)
  },

  loadAccount(id) {
    const account = accountStore.getAccountById(id)
    if (!account) {
      wx.showToast({
        title: '账号不存在',
        icon: 'none'
      })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }

    this.setData({
      id,
      mode: 'detail',
      account,
      form: { ...account },
      selectedLogoKey: account.logo.key,
      showPassword: false,
      showFormPassword: false
    })
    wx.setNavigationBarTitle({ title: account.platform || account.logo.name })
  },

  startEdit() {
    this.setData({
      mode: 'edit',
      form: { ...this.data.account },
      selectedLogoKey: this.data.account.logo.key,
      showFormPassword: false
    })
    wx.setNavigationBarTitle({ title: '编辑账号' })
  },

  cancelEdit() {
    if (this.data.mode === 'create') {
      wx.navigateBack()
      return
    }
    this.setData({
      mode: 'detail',
      form: { ...this.data.account }
    })
    wx.setNavigationBarTitle({ title: this.data.account.platform || this.data.account.logo.name })
  },

  onFieldInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  selectLogo(e) {
    const { key } = e.currentTarget.dataset
    const logo = accountStore.presetLogos.find(item => item.key === key)
    if (!logo) return

    const currentLogo = this.data.form.logo || {}
    const shouldSyncPlatform = this.data.mode === 'create' ||
      !this.data.form.platform ||
      this.data.form.platform === currentLogo.name

    this.setData({
      'form.logo': logo,
      'form.customLogoPath': '',
      selectedLogoKey: key,
      ...(shouldSyncPlatform ? { 'form.platform': logo.name } : {})
    })
  },

  chooseCustomLogo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        wx.saveFile({
          tempFilePath,
          success: saveRes => {
            this.setCustomLogo(saveRes.savedFilePath)
          },
          fail: () => {
            this.setCustomLogo(tempFilePath)
          }
        })
      }
    })
  },

  setCustomLogo(path) {
    const customLogo = accountStore.presetLogos.find(item => item.key === 'custom')
    this.setData({
      'form.logo': customLogo,
      'form.customLogoPath': path,
      selectedLogoKey: 'custom'
    })
  },

  saveAccount() {
    const form = this.data.form
    if (!form.platform.trim()) {
      wx.showToast({ title: '请输入平台名称', icon: 'none' })
      return
    }
    if (!form.username.trim()) {
      wx.showToast({ title: '请输入账号', icon: 'none' })
      return
    }
    if (!form.password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    const payload = {
      platform: form.platform.trim(),
      username: form.username.trim(),
      password: form.password,
      note: form.note.trim(),
      logo: form.logo,
      customLogoPath: form.customLogoPath || ''
    }

    if (this.data.mode === 'create') {
      const account = accountStore.createAccount(payload)
      wx.showToast({ title: '已保存', icon: 'success' })
      wx.redirectTo({
        url: `/pages/account/account?id=${account.id}`
      })
      return
    }

    const account = accountStore.updateAccount(this.data.id, payload)
    wx.showToast({ title: '已保存', icon: 'success' })
    this.setData({
      mode: 'detail',
      account,
      form: { ...account },
      showPassword: false
    })
    wx.setNavigationBarTitle({ title: account.platform })
  },

  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  toggleFormPassword() {
    this.setData({
      showFormPassword: !this.data.showFormPassword
    })
  },

  copyUsername() {
    copyText(this.data.account.username)
  },

  copyPassword() {
    copyText(this.data.account.password)
  },

  deleteAccount() {
    wx.showModal({
      title: '删除账号',
      content: '删除后无法恢复，确定要删除吗？',
      confirmColor: '#d93025',
      success: res => {
        if (!res.confirm) return
        accountStore.deleteAccount(this.data.id)
        wx.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 500)
      }
    })
  }
})
