const CryptoJS = require('../libs/crypto-js/crypto-js')

const VERSION = 1
const ITERATIONS = 20000

const wordArrayToBase64 = wordArray => CryptoJS.enc.Base64.stringify(wordArray)

const base64ToWordArray = value => CryptoJS.enc.Base64.parse(value)

const randomWordArray = byteLength => {
  const buffer = new ArrayBuffer(byteLength)
  const bytes = new Uint8Array(buffer)

  if (wx.getRandomValues) {
    wx.getRandomValues(buffer)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  const words = []
  for (let index = 0; index < bytes.length; index += 1) {
    words[index >>> 2] |= bytes[index] << (24 - (index % 4) * 8)
  }

  return CryptoJS.lib.WordArray.create(words, byteLength)
}

const deriveKey = (masterPassword, saltBase64) => {
  return CryptoJS.PBKDF2(masterPassword, base64ToWordArray(saltBase64), {
    keySize: 256 / 32,
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256
  })
}

const encryptVault = (accounts, masterPassword) => {
  const salt = randomWordArray(16)
  const iv = randomWordArray(16)
  const saltBase64 = wordArrayToBase64(salt)
  const ivBase64 = wordArrayToBase64(iv)
  const key = deriveKey(masterPassword, saltBase64)
  const plaintext = JSON.stringify({
    accounts,
    encryptedAt: Date.now()
  })
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64)
  const mac = CryptoJS.HmacSHA256(`${saltBase64}.${ivBase64}.${ciphertext}`, key).toString(CryptoJS.enc.Base64)

  return {
    version: VERSION,
    algorithm: 'AES-256-CBC+HMAC-SHA256',
    kdf: 'PBKDF2-SHA256',
    iterations: ITERATIONS,
    salt: saltBase64,
    iv: ivBase64,
    ciphertext,
    mac
  }
}

const decryptVault = (payload, masterPassword) => {
  const key = deriveKey(masterPassword, payload.salt)
  const expectedMac = CryptoJS.HmacSHA256(`${payload.salt}.${payload.iv}.${payload.ciphertext}`, key).toString(CryptoJS.enc.Base64)

  if (expectedMac !== payload.mac) {
    throw new Error('同步密钥错误或数据已损坏')
  }

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: base64ToWordArray(payload.ciphertext) },
    key,
    {
      iv: base64ToWordArray(payload.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  )
  const text = decrypted.toString(CryptoJS.enc.Utf8)
  if (!text) throw new Error('解密失败')

  return JSON.parse(text)
}

module.exports = {
  encryptVault,
  decryptVault
}
