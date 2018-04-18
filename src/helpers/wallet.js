const ethers = require('ethers')
const Wallet = ethers.Wallet

/**
 * @description Generates a brain wallet from a username/password pair
 * @param username [String]
 * @param password [String]
 * @returns [Object] - Ethers.js wallet object
 */
export const generateBrainWalletPrivateKey = async (username, password) => {
  let wallet = await Wallet.fromBrainWallet(username, password)
  return wallet
}

/**
 * @description Creates a random (unencrypted) ethers.js wallet object
 * @returns [Object] - Ethers.js wallet object
 */
export const createRandomWallet = async () => {
  let wallet = await Wallet.createRandom()
  return wallet
}

/**
 * @description Creates an (unencrypted) ethers.js wallet object
 * @param privateKey [String]
 * @returns [Object] - Ethers.js wallet object
 */
export const createWalletFromPrivateKey = (privateKey) => {
  let wallet = new Wallet(privateKey)
  return wallet
}

/**
 * @description Creates an (unencrypted) ethers.js wallet object
 * @param mnemonic [String] - 12 word mnemonic string
 * @returns [Object] - Ethers.js wallet object
 */
export const createWalletFromMemnonic = (mnemonic) => {
  let wallet = Wallet.fromMnemonic(mnemonic)
  return wallet
}

/**
 * @description Creates an encrypted ethers.js wallet object and returns it
 * along with it's address
 * @param password [String]
 * @returns [Object] - Ethers.js encrypted wallet and wallet address
 */
export const createAndEncryptWallet = async (password, callback) => {
  let wallet = await Wallet.createRandom()
  let address = wallet.address
  let serialized = await wallet.encrypt(password, callback)
  return { serialized, address }
}

/**
 * @description Decrypts an ethers.js wallet object and returns the plain decrypted object
 * @param jsonWallet [Object]
 * @param password
 * @returns [Object] - Ethers.js wallet
 */
export const decryptWallet = async (jsonWallet, password) => {
  let wallet = await Wallet.fromEncryptedWallet(jsonWallet, password)
  return wallet
}
