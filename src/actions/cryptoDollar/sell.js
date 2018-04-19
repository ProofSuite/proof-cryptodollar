import { getWeb3, getProviderUtils } from '../../helpers/web3'
import { walletAuthenticating, walletAuthenticated, walletAuthenticationError } from '../walletActions'

import { sellCryptoDollarRawTx, sellCryptoDollarSignedTx } from '../../helpers/tx'
import { validateTransaction } from '../../helpers/txValidator'
import { decryptWallet } from '../../helpers/wallet'

export const SELL_CRYPTODOLLAR_TX_STARTED = 'SELL_CRYPTODOLLAR_TX_STARTED'
export const SELL_CRYPTODOLLAR_TX_ERROR = 'SELL_CRYPTODOLLAR_TX_ERROR'
export const SELL_CRYPTODOLLAR_TX_SIGNING = 'SELL_CRYPTODOLLAR_TX_SIGNING'
export const SELL_CRYPTODOLLAR_TX_SIGNED = 'SELL_CRYPTODOLLAR_TX_SIGNED'
export const SELL_CRYPTODOLLAR_TX_SIGNING_ERROR = 'SELL_CRYPTODOLLAR_TX_SIGNING_ERROR'
export const SELL_CRYPTODOLLAR_TX_UPDATED = 'SELL_CRYPTODOLLAR_TX_UPDATED'
export const SELL_CRYPTODOLLAR_TX_SENT = 'SELL_CRYPTODOLLAR_TX_SENT'
export const SELL_CRYPTODOLLAR_TX_RECEIPT = 'SELL_CRYPTODOLLAR_TX_RECEIPT'
export const SELL_CRYPTODOLLAR_TX_CONFIRMED = 'SELL_CRYPTODOLLAR_TX_CONFIRMED'

export const sellCryptoDollarTxStarted = () => ({
  type: SELL_CRYPTODOLLAR_TX_STARTED
})
export const sellCryptoDollarTxError = (error, receipt) => ({
  type: SELL_CRYPTODOLLAR_TX_ERROR,
  payload: { error, receipt }
})
export const sellCryptoDollarTxSigningError = (error) => ({
  type: SELL_CRYPTODOLLAR_TX_SIGNING_ERROR,
  payload: { error }
})
export const sellCryptoDollarTxUpdated = (notification) => ({
  type: SELL_CRYPTODOLLAR_TX_UPDATED,
  payload: notification
})
export const sellCryptoDollarTxSigning = () => ({
  type: SELL_CRYPTODOLLAR_TX_SIGNING
})
export const sellCryptoDollarTxSigned = signature => ({
  type: SELL_CRYPTODOLLAR_TX_SIGNED,
  payload: { signature }
})
export const sellCryptoDollarTxSent = hash => ({
  type: SELL_CRYPTODOLLAR_TX_SENT,
  payload: { hash }
})
export const sellCryptoDollarTxReceipt = receipt => ({
  type: SELL_CRYPTODOLLAR_TX_RECEIPT,
  payload: { receipt }
})
export const sellCryptoDollarTxConfirmed = confirmationNumber => ({
  type: SELL_CRYPTODOLLAR_TX_CONFIRMED,
  payload: confirmationNumber
})

export const validateSellCryptoDollarTx = ({ sender, tokens, gas, gasPrice }) => {
  return async (dispatch, getState) => {
    try {
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0

      let provider = getProviderUtils(getState)
      let rawTx = await sellCryptoDollarRawTx(provider, tokens)
      let params = { from: sender, gasPrice }
      let notification = await validateTransaction(rawTx, params, gas)

      return dispatch(sellCryptoDollarTxUpdated(notification))
    } catch (error) {
      console.log(error)
      let notification = { status: 'invalid', statusMessage: error.message }
      return dispatch(sellCryptoDollarTxUpdated(notification))
    }
  }
}

export const signSellCryptoDollarTx = (wallet, password, tokens, { value, gas, gasPrice }) => {
  return async (dispatch, getState) => {
    let provider, decryptedWallet, sender, privateKey

    try {
      provider = getProviderUtils(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
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
      console.log(error)
      return dispatch(walletAuthenticationError(error.message))
    }

    try {
      dispatch(sellCryptoDollarTxSigning())
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0
      let txParams = { value, gas, gasPrice }
      let { rawTransaction } = await sellCryptoDollarSignedTx(provider, sender, tokens, privateKey, txParams)
      dispatch(sellCryptoDollarTxSigned(rawTransaction))
    } catch (error) {
      console.log(error)
      return dispatch(sellCryptoDollarTxSigningError(error))
    }
  }
}

export const sendSellCryptoDollarTx = (tokens, { sender, value, gas, gasPrice = 2 * 10e9 }) => {
  return async (dispatch, getState) => {
    try {
      let provider = getProviderUtils(getState)
      dispatch(sellCryptoDollarTxStarted())

      let rawTx = await sellCryptoDollarRawTx(provider, tokens)
      let params = { from: sender, value: value * 1e18, gasPrice, gas }

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(sellCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(sellCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(sellCryptoDollarTxReceipt(receipt))
          }
        })
        .on('error', error => {
          dispatch(sellCryptoDollarTxError(error.message, null))
        })
    } catch (error) {
      dispatch(sellCryptoDollarTxError(error.message, null))
    }
  }
}

export const sendSignedSellCryptoDollarTx = (signedTx) => {
  return async (dispatch, getState) => {
    try {
      let web3 = getWeb3(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!signedTx) throw new Error('Signed Tx missing')

      dispatch(sellCryptoDollarTxStarted)
      web3.eth.sendSignedTransaction(signedTx)
        .on('transactionHash', hash => {
          dispatch(sellCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(sellCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(sellCryptoDollarTxReceipt(receipt))
          }
        })
    } catch (error) {
      dispatch(sellCryptoDollarTxError(error.message, null))
    }
  }
}
