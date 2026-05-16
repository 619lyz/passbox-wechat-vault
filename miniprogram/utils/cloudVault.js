const { encryptVault, decryptVault } = require('./vaultCrypto')

const COLLECTION = 'vaults'
const APP_SYNC_SECRET = 'passbox-cloud-sync-v1'
const DOC_ID_KEY = 'passbox_cloud_vault_doc_id'

let syncing = false
let pendingAccounts = null

const uploadEncryptedVault = async accounts => {
  if (syncing) {
    pendingAccounts = accounts
    return
  }
  if (!wx.cloud) return

  syncing = true
  try {
    const encryptedVault = encryptVault(accounts, APP_SYNC_SECRET)
    const db = wx.cloud.database()
    const docId = wx.getStorageSync(DOC_ID_KEY)
    const data = {
      encryptedVault,
      accountCount: accounts.length,
      updatedAt: Date.now()
    }

    console.log('[Passbox sync] start', {
      collection: COLLECTION,
      accountCount: accounts.length,
      hasDocId: !!docId
    })

    if (docId) {
      await db.collection(COLLECTION).doc(docId).update({ data })
    } else {
      const res = await db.collection(COLLECTION).add({ data })
      if (res && res._id) {
        wx.setStorageSync(DOC_ID_KEY, res._id)
      }
    }

    wx.setStorageSync('passbox_last_cloud_sync', data.updatedAt)
    wx.removeStorageSync('passbox_last_cloud_sync_error')
    console.log('[Passbox sync] success')
    wx.showToast({
      title: '已加密同步',
      icon: 'success'
    })
  } catch (error) {
    console.error('uploadEncryptedVault failed', error)
    wx.setStorageSync('passbox_last_cloud_sync_error', {
      errMsg: error.errMsg || error.message || 'unknown error',
      updatedAt: Date.now()
    })
    wx.showToast({
      title: '云端同步失败',
      icon: 'none'
    })
  } finally {
    syncing = false
    if (pendingAccounts) {
      const nextAccounts = pendingAccounts
      pendingAccounts = null
      uploadEncryptedVault(nextAccounts)
    }
  }
}

const downloadEncryptedVault = async () => {
  if (!wx.cloud) return null

  try {
    const db = wx.cloud.database()
    const res = await db.collection(COLLECTION)
      .orderBy('updatedAt', 'desc')
      .limit(1)
      .get()
    const doc = res.data && res.data[0]

    if (!doc || !doc.encryptedVault) return null

    wx.setStorageSync(DOC_ID_KEY, doc._id)
    const vault = decryptVault(doc.encryptedVault, APP_SYNC_SECRET)
    wx.removeStorageSync('passbox_last_cloud_sync_error')

    return {
      accounts: vault.accounts || [],
      updatedAt: doc.updatedAt || 0,
      docId: doc._id
    }
  } catch (error) {
    console.error('downloadEncryptedVault failed', error)
    wx.setStorageSync('passbox_last_cloud_sync_error', {
      errMsg: error.errMsg || error.message || 'unknown error',
      updatedAt: Date.now()
    })
    return null
  }
}

module.exports = {
  uploadEncryptedVault,
  downloadEncryptedVault
}
