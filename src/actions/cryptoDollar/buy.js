import { getWeb3, getProviderUtils } from '../../helpers/web3'
import { walletAuthenticating, walletAuthenticated, walletAuthenticationError } from '../walletActions'

import { buyCryptoDollarRawTx, buyCryptoDollarSignedTx } from '../../helpers/tx'
import { validateTransaction } from '../../helpers/txValidator'
import { decryptWallet } from '../../helpers/wallet'

export const BUY_CRYPTODOLLAR_TX_STARTED = 'BUY_CRYPTODOLLAR_TX_STARTED'
export const BUY_CRYPTODOLLAR_TX_ERROR = 'BUY_CRYPTODOLLAR_TX_ERROR'
export const BUY_CRYPTODOLLAR_TX_SIGNING = 'BUY_CRYPTODOLLAR_TX_SIGNING'
export const BUY_CRYPTODOLLAR_TX_SIGNED = 'BUY_CRYPTODOLLAR_TX_SIGNED'
export const BUY_CRYPTODOLLAR_TX_SIGNING_ERROR = 'BUY_CRYPTODOLLAR_TX_SIGNING_ERROR'
export const BUY_CRYPTODOLLAR_TX_UPDATED = 'BUY_CRYPTODOLLAR_TX_UPDATED'
export const BUY_CRYPTODOLLAR_TX_SENT = 'BUY_CRYPTODOLLAR_TX_SENT'
export const BUY_CRYPTODOLLAR_TX_RECEIPT = 'BUY_CRYPTODOLLAR_TX_RECEIPT'
export const BUY_CRYPTODOLLAR_TX_CONFIRMED = 'BUY_CRYPTODOLLAR_TX_CONFIRMED'

export const buyCryptoDollarTxStarted = () => ({
  type: BUY_CRYPTODOLLAR_TX_STARTED
})
export const buyCryptoDollarTxError = (error, receipt) => ({
  type: BUY_CRYPTODOLLAR_TX_ERROR,
  payload: { error, receipt }
})
export const buyCryptoDollarTxSigningError = (error) => ({
  type: BUY_CRYPTODOLLAR_TX_SIGNING_ERROR,
  payload: { error }
})
export const buyCryptoDollarTxUpdated = (notification) => ({
  type: BUY_CRYPTODOLLAR_TX_UPDATED,
  payload: notification
})
export const buyCryptoDollarTxSigning = () => ({
  type: BUY_CRYPTODOLLAR_TX_SIGNING
})
export const buyCryptoDollarTxSigned = signature => ({
  type: BUY_CRYPTODOLLAR_TX_SIGNED,
  payload: { signature }
})
export const buyCryptoDollarTxSent = hash => ({
  type: BUY_CRYPTODOLLAR_TX_SENT,
  payload: { hash }
})
export const buyCryptoDollarTxReceipt = receipt => ({
  type: BUY_CRYPTODOLLAR_TX_RECEIPT,
  payload: { receipt }
})
export const buyCryptoDollarTxConfirmed = confirmationNumber => ({
  type: BUY_CRYPTODOLLAR_TX_CONFIRMED,
  payload: confirmationNumber
})

export const validateBuyCryptoDollarTx = ({ sender, value, gas, gasPrice }) => {
  return async (dispatch, getState) => {
    try {
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0

      let provider = getProviderUtils(getState)
      let rawTx = await buyCryptoDollarRawTx(provider)
      let params = { from: sender, value: value * 10e18, gasPrice }
      let notification = await validateTransaction(rawTx, params, gas)

      return dispatch(buyCryptoDollarTxUpdated(notification))
    } catch (error) {
      console.log(error)
      let notification = { status: 'invalid', statusMessage: error.message }
      return dispatch(buyCryptoDollarTxUpdated(notification))
    }
  }
}

export const signBuyCryptoDollarTx = (wallet, password, { value, gas, gasPrice }) => {
  return async (dispatch, getState) => {
    let provider, decryptedWallet, sender, privateKey

    try {
      provider = getProviderUtils(getState)
      if (typeof provider.web3 === 'undefined') throw new Error('Provider not found')
    } catch (error) {
      return console.log(error.message)
    }

    try {
      dispatch(walletAuthenticating())
      decryptedWallet = await decryptWallet(wallet.serialized, password)
      privateKey = decryptedWallet.privateKey
      sender = decryptedWallet.address
      dispatch(walletAuthenticated())
    } catch (error) {
      return dispatch(walletAuthenticationError(error.message))
    }

    try {
      dispatch(buyCryptoDollarTxSigning())
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0
      let txParams = { value, gas, gasPrice }
      let result = await buyCryptoDollarSignedTx(provider, sender, privateKey, txParams)
      dispatch(buyCryptoDollarTxSigned(result.rawTransaction))
    } catch (error) {
      console.log(error)
      return dispatch(buyCryptoDollarTxSigningError(error.message))
    }
  }
}

export const sendBuyCryptoDollarTx = ({ sender, value, gas, gasPrice = 2 * 10e9 }) => {
  return async (dispatch, getState) => {
    try {
      dispatch(buyCryptoDollarTxStarted())
      let provider = getProviderUtils(getState)

      let rawTx = await buyCryptoDollarRawTx(provider)
      let params = { from: sender, value: value * 1e18, gasPrice, gas }

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(buyCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(buyCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(buyCryptoDollarTxReceipt(receipt))
          }
        })
        .on('error', error => {
          dispatch(buyCryptoDollarTxError(error.message, null))
        })
    } catch (error) {
      dispatch(buyCryptoDollarTxError(error.message, null))
    }
  }
}

export const sendSignedBuyCryptoDollarTx = (signedTx) => {
  return async (dispatch, getState) => {
    try {
      let web3 = getWeb3(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!signedTx) throw new Error('Signed Tx missing')

      dispatch(buyCryptoDollarTxStarted)
      web3.eth.sendSignedTransaction(signedTx)
        .on('transactionHash', hash => {
          dispatch(buyCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(buyCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(buyCryptoDollarTxReceipt(receipt))
          }
        })
    } catch (error) {
      dispatch(buyCryptoDollarTxError(error.message, null))
    }
  }
}
