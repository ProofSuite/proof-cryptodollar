import { getWeb3, getProviderUtils } from '../../helpers/web3'
import {
  walletAuthenticating,
  walletAuthenticated,
  walletAuthenticationError
} from '../walletActions'

import { sellUnpeggedCryptoDollarRawTx, sellUnpeggedCryptoDollarSignedTx } from '../../helpers/tx'
import { decryptWallet } from '../../helpers/wallet'
import { validateTransaction } from '../../helpers/txValidator'

export const SELL_UNPEGGED_CRYPTODOLLAR_TX_STARTED = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_STARTED'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_ERROR = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_ERROR'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNING = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNING'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNED = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNED'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNING_ERROR =
  'SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNING_ERROR'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_UPDATED = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_UPDATED'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_SENT = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_SENT'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_RECEIPT = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_RECEIPT'
export const SELL_UNPEGGED_CRYPTODOLLAR_TX_CONFIRMED = 'SELL_UNPEGGED_CRYPTODOLLAR_TX_CONFIRMED'

export const sellUnpeggedCryptoDollarTxStarted = () => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_STARTED
})
export const sellUnpeggedCryptoDollarTxError = (error, receipt) => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_ERROR,
  payload: { error, receipt }
})
export const sellUnpeggedCryptoDollarTxSigningError = error => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNING_ERROR,
  payload: { error }
})
export const sellUnpeggedCryptoDollarTxUpdated = notification => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_UPDATED,
  payload: notification
})
export const sellUnpeggedCryptoDollarTxSigning = () => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNING
})
export const sellUnpeggedCryptoDollarTxSigned = signature => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_SIGNED,
  payload: { signature }
})
export const sellUnpeggedCryptoDollarTxSent = hash => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_SENT,
  payload: { hash }
})
export const sellUnpeggedCryptoDollarTxReceipt = receipt => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_RECEIPT,
  payload: { receipt }
})
export const sellUnpeggedCryptoDollarTxConfirmed = confirmationNumber => ({
  type: SELL_UNPEGGED_CRYPTODOLLAR_TX_CONFIRMED,
  payload: confirmationNumber
})

export const validateSellUnpeggedCryptoDollarTx = ({ sender, value, gas, gasPrice }) => {
  return async (dispatch, getState) => {
    try {
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0

      let provider = getProviderUtils(getState)
      let rawTx = await sellUnpeggedCryptoDollarRawTx(provider)
      let params = { from: sender, value: value * 10e18, gasPrice }
      let notification = await validateTransaction(rawTx, params, gas)

      return dispatch(sellUnpeggedCryptoDollarTxUpdated(notification))
    } catch (error) {
      console.log(error)
      let notification = { status: 'invalid', statusMessage: error.message }
      return dispatch(sellUnpeggedCryptoDollarTxUpdated(notification))
    }
  }
}

export const signSellUnpeggedCryptoDollarTx = (wallet, password, txParams) => {
  return async (dispatch, getState) => {
    let provider, decryptedWallet, sender, privateKey

    try {
      provider = getProviderUtils(getState)
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
      dispatch(sellUnpeggedCryptoDollarTxSigning())
      txParams.gasPrice = txParams.gasPrice || 2 * 10e9
      txParams.gas = txParams.gas || 0
      let { rawTransaction } = await sellUnpeggedCryptoDollarSignedTx(provider, sender, privateKey, txParams)
      dispatch(sellUnpeggedCryptoDollarTxSigned(rawTransaction))
    } catch (error) {
      console.log(error)
      return dispatch(sellUnpeggedCryptoDollarTxSigningError(error))
    }
  }
}

export const sendSellUnpeggedCryptoDollarTx = (tokens, { sender, value, gas, gasPrice = 2 * 10e9 }) => {
  return async (dispatch, getState) => {
    try {
      let provider = getProviderUtils(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!sender) throw new Error('Sender Address not provided')
      if (!value) throw new Error('Token Amount not provided')

      dispatch(sellUnpeggedCryptoDollarTxStarted())

      let rawTx = await sellUnpeggedCryptoDollarRawTx(provider)
      let params = { from: sender, value: value * 1e18, gasPrice, gas }

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(sellUnpeggedCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(sellUnpeggedCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(sellUnpeggedCryptoDollarTxReceipt(receipt))
          }
        })
        .on('error', error => {
          dispatch(sellUnpeggedCryptoDollarTxError(error.message, null))
        })
    } catch (error) {
      dispatch(sellUnpeggedCryptoDollarTxError(error.message, null))
    }
  }
}

export const sendSignedSellUnpeggedCryptoDollarTx = signedTx => {
  return async (dispatch, getState) => {
    try {
      let web3 = getWeb3(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!signedTx) throw new Error('Signed Tx missing')

      dispatch(sellUnpeggedCryptoDollarTxStarted())
      web3.eth
        .sendSignedTransaction(signedTx)
        .on('transactionHash', hash => {
          dispatch(sellUnpeggedCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(sellUnpeggedCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(sellUnpeggedCryptoDollarTxReceipt(receipt))
          }
        })
    } catch (error) {
      dispatch(sellUnpeggedCryptoDollarTxError(error.message, null))
    }
  }
}
