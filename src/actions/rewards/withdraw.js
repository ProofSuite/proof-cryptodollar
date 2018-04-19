import { getProviderUtils, getWeb3 } from '../../helpers/web3'
import { withdrawRewardsRawTx, withdrawRewardsSignedTx } from '../../helpers/tx'
import { walletAuthenticated, walletAuthenticationError, walletAuthenticating } from '../walletActions'

import { validateTransaction } from '../../helpers/txValidator'
import { decryptWallet } from '../../helpers/wallet'

export const WITHDRAW_REWARDS_TX_STARTED = 'WITHDRAW_REWARDS_TX_STARTED'
export const WITHDRAW_REWARDS_TX_ERROR = 'WITHDRAW_REWARDS_TX_ERROR'
export const WITHDRAW_REWARDS_TX_SIGNING = 'WITHDRAW_REWARDS_TX_SIGNING'
export const WITHDRAW_REWARDS_TX_SIGNED = 'WITHDRAW_REWARDS_TX_SIGNED'
export const WITHDRAW_REWARDS_TX_SIGNING_ERROR = 'WITHDRAW_REWARDS_TX_SIGNING_ERROR'
export const WITHDRAW_REWARDS_TX_UPDATED = 'WITHDRAW_REWARDS_TX_UPDATED'
export const WITHDRAW_REWARDS_TX_SENT = 'WITHDRAW_REWARDS_TX_SENT'
export const WITHDRAW_REWARDS_TX_RECEIPT = 'WITHDRAW_REWARDS_TX_RECEIPT'
export const WITHDRAW_REWARDS_TX_CONFIRMED = 'WITHDRAW_REWARDS_TX_CONFIRMED'

export const withdrawRewardsTxStarted = () => ({
  type: WITHDRAW_REWARDS_TX_STARTED
})
export const withdrawRewardsTxError = (error, receipt) => ({
  type: WITHDRAW_REWARDS_TX_ERROR,
  payload: { error, receipt }
})
export const withdrawRewardsTxSigningError = (error) => ({
  type: WITHDRAW_REWARDS_TX_SIGNING_ERROR,
  payload: { error }
})
export const withdrawRewardsTxUpdated = (notification) => ({
  type: WITHDRAW_REWARDS_TX_UPDATED,
  payload: notification
})
export const withdrawRewardsTxSigning = () => ({
  type: WITHDRAW_REWARDS_TX_SIGNING
})
export const withdrawRewardsTxSigned = signature => ({
  type: WITHDRAW_REWARDS_TX_SIGNED,
  payload: { signature }
})
export const withdrawRewardsTxSent = hash => ({
  type: WITHDRAW_REWARDS_TX_SENT,
  payload: { hash }
})
export const withdrawRewardsTxReceipt = receipt => ({
  type: WITHDRAW_REWARDS_TX_RECEIPT,
  payload: { receipt }
})
export const withdrawRewardsTxConfirmed = confirmationNumber => ({
  type: WITHDRAW_REWARDS_TX_CONFIRMED,
  payload: confirmationNumber
})

export const validateWithdrawRewardsTx = ({ sender, value, gas, gasPrice }) => {
  return async (dispatch, getState) => {
    try {
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0

      let provider = getProviderUtils(getState)
      let rawTx = await withdrawRewardsRawTx(provider)
      let params = { from: sender, value: value * 10e18, gasPrice }
      let notification = await validateTransaction(rawTx, params, gas)

      return dispatch(withdrawRewardsTxUpdated(notification))
    } catch (error) {
      let notification = { status: 'invalid', statusMessage: error.message }
      return dispatch(withdrawRewardsTxUpdated(notification))
    }
  }
}

export const signWithdrawRewardsTx = (wallet, password, { sender, gas, gasPrice }) => {
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
      dispatch(walletAuthenticationError(error.message))
    }

    try {
      dispatch(withdrawRewardsTxSigning())
      gasPrice = gasPrice || 2 * 10e9
      gas = gas || 0
      let txParams = { gas, gasPrice }
      let { rawTransaction } = await withdrawRewardsSignedTx(provider, sender, privateKey, txParams)
      dispatch(withdrawRewardsTxSigned(rawTransaction))
    } catch (error) {
      dispatch(withdrawRewardsTxSigningError(error.message))
    }
  }
}

export const sendWithdrawRewardsTx = ({ sender, value, gas, gasPrice = 2 * 10e9 }) => {
  return async (dispatch, getState) => {
    try {
      let web3 = getWeb3(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!sender) throw new Error('Sender Address not provided')
      if (!value) throw new Error('Token Amount not provided')

      dispatch(withdrawRewardsTxStarted)

      let rawTx = await withdrawRewardsRawTx(web3)
      let params = { from: sender, value: value * 1e18, gasPrice, gas }

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(withdrawRewardsTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(withdrawRewardsTxError('Transaction Failed', receipt))
          } else {
            dispatch(withdrawRewardsTxReceipt(receipt))
          }
        })
        .on('error', error => {
          dispatch(withdrawRewardsTxError(error.message, null))
        })
    } catch (error) {
      dispatch(withdrawRewardsTxError(error.message, null))
    }
  }
}

export const sendSignedWithdrawRewardsTx = (signedTx) => {
  return async (dispatch, getState) => {
    try {
      let signedTx = getState().ui.withdrawRewards.tx.signature
      let web3 = getWeb3(getState)
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!signedTx) throw new Error('Signed Tx missing')

      dispatch(withdrawRewardsTxStarted)
      web3.eth.sendSignedTransaction(signedTx)
        .on('transactionHash', hash => {
          dispatch(withdrawRewardsTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(withdrawRewardsTxError('Transaction Failed', receipt))
          } else {
            dispatch(withdrawRewardsTxReceipt(receipt))
          }
        })
    } catch (error) {
      dispatch(withdrawRewardsTxError(error.message, null))
    }
  }
}
