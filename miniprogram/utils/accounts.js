const STORAGE_KEY = 'passbox_accounts'
const LOCAL_UPDATED_KEY = 'passbox_accounts_updated_at'
const cloudVault = require('./cloudVault')

const presetLogos = [
  { key: 'wechat', name: '微信', text: '微', bg: '#2aae67', color: '#ffffff', image: '/assets/logos/wechat.png' },
  { key: 'qq', name: 'QQ', text: 'Q', bg: '#12b7f5', color: '#ffffff', image: '/assets/logos/qq.png' },
  { key: 'alipay', name: '支付宝', text: '支', bg: '#1677ff', color: '#ffffff', image: '/assets/logos/alipay.png' },
  { key: 'taobao', name: '淘宝', text: '淘', bg: '#ff6a00', color: '#ffffff', image: '/assets/logos/taobao.png' },
  { key: 'jd', name: '京东', text: '京', bg: '#e2231a', color: '#ffffff', image: '/assets/logos/jd.png' },
  { key: 'douyin', name: '抖音', text: '抖', bg: '#111111', color: '#ffffff', image: '/assets/logos/douyin.png' },
  { key: 'bilibili', name: '哔哩哔哩', text: 'B', bg: '#00a1d6', color: '#ffffff', image: '/assets/logos/bilibili.png' },
  { key: 'xiaohongshu', name: '小红书', text: '红', bg: '#ff2442', color: '#ffffff', image: '/assets/logos/xiaohongshu.png' },
  { key: 'github', name: 'GitHub', text: 'GH', bg: '#24292f', color: '#ffffff', image: '/assets/logos/github.png' },
  { key: 'gmail', name: 'Gmail', text: 'G', bg: '#ea4335', color: '#ffffff', image: '/assets/logos/gmail.png' },
  { key: 'apple', name: 'Apple', text: 'A', bg: '#1d1d1f', color: '#ffffff', image: '/assets/logos/apple.png' },
  { key: 'microsoft', name: 'Microsoft', text: 'M', bg: '#00a4ef', color: '#ffffff', image: '/assets/logos/microsoft.png' },
  { key: 'steam', name: 'Steam', text: 'S', bg: '#171a21', color: '#ffffff', image: '/assets/logos/steam.png' },
  { key: 'netflix', name: 'Netflix', text: 'N', bg: '#e50914', color: '#ffffff', image: '/assets/logos/netflix.png' },
  { key: 'spotify', name: 'Spotify', text: 'S', bg: '#1db954', color: '#111111', image: '/assets/logos/spotify.png' },
  { key: 'custom', name: '自定义', text: '+', bg: '#f1f5f9', color: '#334155' }
]

const getAccounts = () => {
  return wx.getStorageSync(STORAGE_KEY) || []
}

const saveAccounts = accounts => {
  wx.setStorageSync(STORAGE_KEY, accounts)
  wx.setStorageSync(LOCAL_UPDATED_KEY, Date.now())
}

const syncAccounts = accounts => {
  cloudVault.uploadEncryptedVault(accounts)
}

const replaceAccountsFromCloud = (accounts, updatedAt) => {
  wx.setStorageSync(STORAGE_KEY, accounts)
  wx.setStorageSync(LOCAL_UPDATED_KEY, updatedAt || Date.now())
}

const syncFromCloud = async () => {
  const localUpdatedAt = wx.getStorageSync(LOCAL_UPDATED_KEY) || 0
  const remoteVault = await cloudVault.downloadEncryptedVault()

  if (!remoteVault || !remoteVault.updatedAt) {
    return {
      changed: false,
      accounts: getAccounts()
    }
  }

  if (remoteVault.updatedAt > localUpdatedAt) {
    replaceAccountsFromCloud(remoteVault.accounts, remoteVault.updatedAt)
    wx.setStorageSync('passbox_last_cloud_sync', remoteVault.updatedAt)
    return {
      changed: true,
      accounts: remoteVault.accounts
    }
  }

  return {
    changed: false,
    accounts: getAccounts()
  }
}

const createAccount = account => {
  const accounts = getAccounts()
  const now = Date.now()
  const nextAccount = {
    id: `${now}`,
    platform: '',
    username: '',
    password: '',
    note: '',
    logo: presetLogos[0],
    customLogoPath: '',
    createdAt: now,
    updatedAt: now,
    ...account
  }

  accounts.unshift(nextAccount)
  saveAccounts(accounts)
  syncAccounts(accounts)
  return nextAccount
}

const updateAccount = (id, patch) => {
  const accounts = getAccounts()
  const nextAccounts = accounts.map(account => {
    if (account.id !== id) return account
    return {
      ...account,
      ...patch,
      updatedAt: Date.now()
    }
  })

  saveAccounts(nextAccounts)
  syncAccounts(nextAccounts)
  return nextAccounts.find(account => account.id === id)
}

const deleteAccount = id => {
  const nextAccounts = getAccounts().filter(account => account.id !== id)
  saveAccounts(nextAccounts)
  syncAccounts(nextAccounts)
}

const deleteAccounts = ids => {
  const idMap = ids.reduce((map, id) => {
    map[id] = true
    return map
  }, {})
  const nextAccounts = getAccounts().filter(account => !idMap[account.id])
  saveAccounts(nextAccounts)
  syncAccounts(nextAccounts)
}

const getAccountById = id => {
  return getAccounts().find(account => account.id === id)
}

module.exports = {
  presetLogos,
  getAccounts,
  syncFromCloud,
  createAccount,
  updateAccount,
  deleteAccount,
  deleteAccounts,
  getAccountById
}
