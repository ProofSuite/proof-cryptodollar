import { getWeb3, getProviderUtils } from '../../helpers/web3'
import {
  walletAuthenticating,
  walletAuthenticated,
  walletAuthenticationError
} from '../walletActions'

import { decryptWallet } from '../../helpers/wallet'
import { transferCryptoDollarRawTx, transferCryptoDollarSignedTx } from '../../helpers/tx'
import { validateTransaction } from '../../helpers/txValidator'

export const TRANSFER_CRYPTODOLLAR_TX_STARTED = 'TRANSFER_CRYPTODOLLAR_TX_STARTED'
export const TRANSFER_CRYPTODOLLAR_TX_ERROR = 'TRANSFER_CRYPTODOLLAR_TX_ERROR'
export const TRANSFER_CRYPTODOLLAR_TX_SIGNING = 'TRANSFER_CRYPTODOLLAR_TX_SIGNING'
export const TRANSFER_CRYPTODOLLAR_TX_SIGNED = 'TRANSFER_CRYPTODOLLAR_TX_SIGNED'
export const TRANSFER_CRYPTODOLLAR_TX_SIGNING_ERROR = 'TRANSFER_CRYPTODOLLAR_TX_SIGNING_ERROR'
export const TRANSFER_CRYPTODOLLAR_TX_UPDATED = 'TRANSFER_CRYPTODOLLAR_TX_UPDATED'
export const TRANSFER_CRYPTODOLLAR_TX_SENT = 'TRANSFER_CRYPTODOLLAR_TX_SENT'
export const TRANSFER_CRYPTODOLLAR_TX_RECEIPT = 'TRANSFER_CRYPTODOLLAR_TX_RECEIPT'
export const TRANSFER_CRYPTODOLLAR_TX_CONFIRMED = 'TRANSFER_CRYPTODOLLAR_TX_CONFIRMED'

export const transferCryptoDollarTxStarted = () => ({
  type: TRANSFER_CRYPTODOLLAR_TX_STARTED
})
export const transferCryptoDollarTxError = (error, receipt) => ({
  type: TRANSFER_CRYPTODOLLAR_TX_ERROR,
  payload: { error, receipt }
})
export const transferCryptoDollarTxSigningError = error => ({
  type: TRANSFER_CRYPTODOLLAR_TX_SIGNING_ERROR,
  payload: { error }
})
export const transferCryptoDollarTxUpdated = notification => ({
  type: TRANSFER_CRYPTODOLLAR_TX_UPDATED,
  payload: notification
})
export const transferCryptoDollarTxSigning = () => ({
  type: TRANSFER_CRYPTODOLLAR_TX_SIGNING
})
export const transferCryptoDollarTxSigned = signature => ({
  type: TRANSFER_CRYPTODOLLAR_TX_SIGNED,
  payload: { signature }
})
export const transferCryptoDollarTxSent = hash => ({
  type: TRANSFER_CRYPTODOLLAR_TX_SENT,
  payload: { hash }
})
export const transferCryptoDollarTxReceipt = receipt => ({
  type: TRANSFER_CRYPTODOLLAR_TX_RECEIPT,
  payload: { receipt }
})
export const transferCryptoDollarTxConfirmed = confirmationNumber => ({
  type: TRANSFER_CRYPTODOLLAR_TX_CONFIRMED,
  payload: confirmationNumber
})

export const validateTransferCryptoDollarTx = (receiver, amount, { sender, value, gas, gasPrice }) => {
  return async (dispatch, getState) => {
    try {
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0
      value = value * 10e18

      let provider = getProviderUtils(getState)
      let rawTx = await transferCryptoDollarRawTx(provider)
      let params = { from: sender, value, gasPrice }
      let notification = await validateTransaction(rawTx, params, gas)

      return dispatch(transferCryptoDollarTxUpdated(notification))
    } catch (error) {
      console.log(error)
      let notification = { status: 'invalid', statusMessage: error.message }
      return dispatch(transferCryptoDollarTxUpdated(notification))
    }
  }
}

export const signTransferCryptoDollarTx = (wallet, password, receiver, amount, txParams) => {
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
      dispatch(transferCryptoDollarTxSigning())
      txParams.gasPrice = txParams.gasPrice || 2 * 10e9
      txParams.gas = txParams.gas || 0
      let { rawTransaction } = await transferCryptoDollarSignedTx(
        provider,
        sender,
        receiver,
        amount,
        privateKey,
        txParams
      )
      dispatch(transferCryptoDollarTxSigned(rawTransaction))
    } catch (error) {
      console.log(error)
      return dispatch(transferCryptoDollarTxSigningError(error))
    }
  }
}

export const sendTransferCryptoDollarTx = (
  amount,
  receiver,
  { sender, value, gas, gasPrice = 2 * 10e9 }
) => {
  return async (dispatch, getState) => {
    try {
      let provider = getProviderUtils(getState)
      dispatch(transferCryptoDollarTxStarted)

      let rawTx = await transferCryptoDollarRawTx(provider, amount, receiver)
      let params = { from: sender, value: value * 1e18, gasPrice, gas }

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(transferCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(transferCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(transferCryptoDollarTxReceipt(receipt))
          }
        })
        .on('error', error => {
          dispatch(transferCryptoDollarTxError(error.message, null))
        })
    } catch (error) {
      dispatch(transferCryptoDollarTxError(error.message, null))
    }
  }
}

export const sendSignedTransferCryptoDollarTx = signedTx => {
  return async (dispatch, getState) => {
    try {
      let web3 = getWeb3(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!signedTx) throw new Error('Signed Tx missing')

      dispatch(transferCryptoDollarTxStarted)
      web3.eth
        .sendSignedTransaction(signedTx)
        .on('transactionHash', hash => {
          dispatch(transferCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(transferCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(transferCryptoDollarTxReceipt(receipt))
          }
        })
    } catch (error) {
      dispatch(transferCryptoDollarTxError(error.message, null))
    }
  }
}
