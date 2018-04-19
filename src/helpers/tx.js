import CryptoFiatHub from '../../build/contracts/CryptoFiatHub.json'
import CryptoDollar from '../../build/contracts/CryptoDollar.json'
import Rewards from '../../build/contracts/Rewards.json'
import { getContractInstance } from './contractHelpers'

/**
 * @description Creates a raw buyCryptoDollar transaction
 * @param web3 [Object] - web3 instance
 * @returns Raw Transaction
 */
export const buyCryptoDollarRawTx = async (provider) => {
  let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
  let rawTx = await cryptoFiatHub.methods.buyCryptoDollar()
  return rawTx
}

/**
 * @description Creates a raw sellCryptoDollar transaction
 * @param web3 [Object] - web3 instance
 * @returns Raw Transaction
 */
export const sellCryptoDollarRawTx = async (provider, tokens) => {
  let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
  let rawTx = await cryptoFiatHub.methods.sellCryptoDollar(tokens)
  return rawTx
}

/**
 * @description Creates a raw sellUnpeggedCryptoDollar transaction
 * @param web3 [Object] - web3 instance
 * @returns Raw Transaction
 */
export const sellUnpeggedCryptoDollarRawTx = async (provider, tokens) => {
  let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
  let rawTx = await cryptoFiatHub.methods.sellUnpeggedCryptoDollar(tokens)
  return rawTx
}

/**
 * @description Creates a raw transferCryptoDollar transaction
 * @param web3 [Object] - web3 instance
 * @returns Raw Transaction
 */
export const transferCryptoDollarRawTx = async (provider, amount, receiver) => {
  let cryptoDollar = getContractInstance(CryptoDollar, provider)
  let rawTx = await cryptoDollar.methods.transfer(amount, receiver)
  return rawTx
}

/**
 * @description Creates a raw withdrawRewards transaction
 * @param web3 [Object] - web3 instance
 * @returns Raw Transaction
 */
export const withdrawRewardsRawTx = async (provider) => {
  let cryptoDollar = getContractInstance(Rewards, provider)
  let rawTx = await cryptoDollar.methods.withdrawRewards()
  return rawTx
}

export const txSigner = async (provider, sender, privateKey, txParams) => {
  let { to, gas, gasPrice, value, data } = txParams
  let tx = {
    chainId: provider.networkID,
    from: sender,
    to,
    gas,
    gasPrice,
    value,
    data
  }

  let signedTx = await provider.web3.eth.accounts.signTransaction(tx, privateKey)
  return signedTx
}

export const buyCryptoDollarSignedTx = async (provider, sender, privateKey, txParams) => {
  let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
  txParams.to = cryptoFiatHub.addres
  txParams.data = cryptoFiatHub.methods.buyCryptoDollar().encodeABI()

  let signedTx = await txSigner(provider, sender, privateKey, txParams)
  return signedTx
}

export const sellCryptoDollarSignedTx = async (provider, sender, tokens, privateKey, txParams) => {
  let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
  txParams.to = cryptoFiatHub.address
  txParams.data = cryptoFiatHub.methods.sellCryptoDollar(tokens).encodeABI()

  let signedTx = await txSigner(provider, sender, privateKey, txParams)
  return signedTx
}

export const sellUnpeggedCryptoDollarSignedTx = async (provider, sender, tokens, privateKey, txParams) => {
  let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
  txParams.to = cryptoFiatHub.address
  txParams.data = cryptoFiatHub.methods.sellUnpeggedCryptoDollar(tokens).encodeABI()

  let signedTx = await txSigner(provider, sender, privateKey, txParams)
  return signedTx
}

export const transferCryptoDollarSignedTx = async (provider, sender, receiver, amount, privateKey, txParams) => {
  let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
  txParams.to = cryptoFiatHub.address
  txParams.data = cryptoFiatHub.methods.transferCryptoDollar(receiver, amount).encodeABI()

  let signedTx = await txSigner(provider, sender, receiver, amount, privateKey, txParams)
  return signedTx
}

export const withdrawRewardsSignedTx = async (provider, sender, privateKey, txParams) => {
  let rewards = getContractInstance(Rewards, provider)
  txParams.to = rewards.address
  txParams.data = rewards.methods.withdrawRewards().encodeABI()

  let signedTx = await txSigner(provider, sender, privateKey, txParams)
  return signedTx
}
