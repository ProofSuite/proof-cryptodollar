import store from '../../redux-store'
import CryptoFiatHub from '../../../build/contracts/CryptoFiatHub.json'
import CryptoDollar from '../../../build/contracts/CryptoDollar.json'
import { getWeb3ContractInstance } from '../../helpers/contractHelpers'
import accounting from 'accounting-js'

const actions = {
  fetchingCryptoDollarState: () => ({
    type: 'FETCHING_CRYPTODOLLAR_STATE'
  }),
  fetchCryptoDollarStateError: () => ({
    type: 'FETCH_CRYPTODOLLAR_STATE_ERROR'
  }),
  fetchCryptoDollarStateSuccess: (data) => ({
    type: 'FETCH_CRYPTODOLLAR_STATE_SUCCESS', payload: data
  }),

  buyCryptoDollarTxStarted: () => ({
    type: 'BUY_CRYPTODOLLAR_TX_STARTED'
  }),
  buyCryptoDollarTxError: (error, receipt) => ({
    type: 'BUY_CRYPTODOLLAR_TX_ERROR',
    payload: { error, receipt }
  }),
  buyCryptoDollarTxSent: transactionHash => ({
    type: 'BUY_CRYPTODOLLAR_TX_SENT',
    payload: transactionHash
  }),
  buyCryptoDollarTxReceipt: receipt => ({
    type: 'BUY_CRYPTODOLLAR_TX_RECEIPT',
    payload: receipt
  }),
  buyCryptoDollarTxConfirmed: confirmationNumber => ({
    type: 'BUY_CRYPTODOLLAR_TX_CONFIRMED',
    payload: confirmationNumber
  }),

  sellCryptoDollarTxStarted: () => ({
    type: 'SELL_CRYPTODOLLAR_TX_STARTED'
  }),
  sellCryptoDollarTxError: (error, receipt) => ({
    type: 'SELL_CRYPTODOLLAR_TX_ERROR',
    payload: { error, receipt }
  }),
  sellCryptoDollarTxSent: txHash => ({
    type: 'SELL_CRYPTODOLLAR_TX_SENT',
    payload: txHash
  }),
  sellCryptoDollarTxReceipt: receipt => ({
    type: 'SELL_CRYPTODOLLAR_TX_RECEIPT',
    payload: receipt
  }),
  sellCryptoDollarTxConfirmed: confirmationNumber => ({
    type: 'SELL_CRYPTODOLLAR_TX_CONFIRMED',
    payload: confirmationNumber
  }),

  sellUnpeggedCryptoDollarTxStarted: () => ({
    type: 'SELL_UNPEGGED_CRYPTODOLLAR_TX_STARTED'
  }),
  sellUnpeggedCryptoDollarTxError: (message, receipt) => ({
    type: 'SELL_UNPEGGED_CRYPTODOLLAR_TX_ERROR',
    payload: { message, receipt }
  }),
  sellUnpeggedCryptoDollarTxSent: txHash => ({
    type: 'BUY_CRYPTODOLLAR_TX_HASH',
    payload: txHash
  }),
  sellUnpeggedCryptoDollarTxReceipt: receipt => ({
    type: 'SELL_UNPEGGED_CRYPTODOLLAR_TX_RECEIPT',
    payload: receipt
  }),
  sellUnpeggedCryptoDollarTxConfirmed: confirmationNumber => ({
    type: 'SELL_UNPEGGED_CRYPTODOLLAR_TX_CONFIRMED',
    payload: confirmationNumber
  }),

  transferCryptoDollarTxStarted: () => ({
    type: 'TRANSFER_CRYPTODOLLAR_TX_STARTED'
  }),
  transferCryptoDollarTxError: (message, receipt) => ({
    type: 'TRANSFER_CRYPTODOLLAR_TX_ERROR',
    payload: { message, receipt }
  }),
  transferCryptoDollarTxSent: txHash => ({
    type: 'TRANSFER_CRYPTODOLLAR_TX_SENT',
    payload: txHash
  }),
  transferCryptoDollarTxReceipt: receipt => ({
    type: 'TRANSFER_CRYPTODOLLAR_TX_RECEIPT',
    payload: receipt
  }),
  transferCryptoDollarTxConfirmed: confirmationNumber => ({
    type: 'SELL_UNPEGGED_CRYPTODOLLAR_TX_CONFIRMED',
    payload: confirmationNumber
  })
}

export const fetchCryptoDollarContractState = () => {
  return async dispatch => {
    try {
      dispatch(actions.fetchingCryptoDollarState())

      let web3 = store.getState().web3.web3Instance
      if (typeof web3 === 'undefined') dispatch(actions.fetchCryptoDollarStateError())

      let cryptoDollar = getWeb3ContractInstance(web3, CryptoDollar)
      let cryptoFiatHub = getWeb3ContractInstance(web3, CryptoFiatHub)
      let exchangeRate = 87537

      let contractData = await Promise.all([
        cryptoDollar.methods.totalSupply().call(),
        cryptoFiatHub.methods.totalOutstanding(exchangeRate).call(),
        cryptoFiatHub.methods.buffer(exchangeRate).call(),
        cryptoFiatHub.methods.contractBalance().call()
      ])
      let [ totalSupply, totalOutstanding, buffer, contractBalance ] = contractData

      console.log('I am here')

      let data = {
        totalSupply: accounting.formatMoney(totalSupply / 1e2, { symbol: 'CUSD', format: '%v %s' }),
        totalOutstanding: accounting.formatMoney(totalOutstanding / 1e18, { symbol: 'ETH', format: '%v %s' }),
        buffer: accounting.formatMoney(buffer / 1e18, { symbol: 'ETH', format: '%v %s' }),
        contractBalance: accounting.formatMoney(contractBalance / 1e18, { symbol: 'ETH', format: '%v %s' })
      }

      console.log('I am there')

      console.log(data)

      dispatch(actions.fetchCryptoDollarStateSuccess(data))
    } catch (error) {
      dispatch(actions.fetchCryptoDollarStateError(error))
    }
  }
}

export const buyCryptoDollar = ({ sender, value, gas, gasPrice = 2 * 10e9 }) => {
  return async dispatch => {
    try {
      let web3 = store.getState().web3.web3Instance
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!sender) throw new Error('Sender Address not provided')
      if (!value) throw new Error('Token Amount not provided')

      dispatch(actions.buyCryptoDollarTxStarted())

      let cryptoFiatHub = getWeb3ContractInstance(web3, CryptoFiatHub)
      let rawTx = await cryptoFiatHub.methods.buyCryptoDollar()

      let params = {
        from: sender,
        value: value * 1e18,
        gasPrice: gasPrice
      }

      if (!gas) gas = await rawTx.estimateGas(params)
      params.gas = gas

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(actions.buyCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(actions.buyCryptoDollarTxError('Transaction Failed', receipt))
          } else {
            dispatch(actions.buyCryptoDollarTxReceipt(receipt))
          }
        })
        .on('error', error => {
          dispatch(actions.buyCryptoDollarTxError(error.message, null))
        })
    } catch (error) {
      dispatch(actions.buyCryptoDollarTxError(error.message, null))
    }
  }
}

export const sellCryptoDollar = ({ sender, tokens, gas, gasPrice = 2 * 10e9, value }) => {
  return async dispatch => {
    try {
      let web3 = store.getState().web3.web3Instance
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!sender) throw new Error('Sender Address not provided')
      if (!tokens) throw new Error('Token Amount not provided')

      dispatch(actions.sellCryptoDollarTxStarted())

      let cryptoFiatHub = getWeb3ContractInstance(web3, CryptoFiatHub)
      let rawTx = await cryptoFiatHub.methods.sellCryptoDollar(tokens)

      let params = {
        from: sender,
        value: value * 10e18,
        gasPrice: gasPrice
      }

      if (!gas) gas = await rawTx.estimateGas(params)
      params.gas = gas

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(actions.sellCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(actions.sellCryptoDollarTxError('Transaction Failed', receipt))
          }

          dispatch(actions.sellCryptoDollarTxReceipt(receipt))
        })
        .on('error', error => {
          dispatch(actions.sellCryptoDollarTxError(error.message))
        })
    } catch (error) {
      dispatch(actions.sellCryptoDollarTxError(error.message))
    }
  }
}

export const sellUnpeggedCryptoDollar = ({ sender, tokens, gas, gasPrice, value }) => {
  return async dispatch => {
    try {
      let web3 = store.getState().web3.web3Instance
      if (typeof web3 === 'undefined') throw new Error('Provider not found')
      if (!sender) throw new Error('Sender Address not provided')
      if (!tokens) throw new Error('Token amount not provided')

      dispatch(actions.sellUnpeggedCryptoDollarTxStarted())

      let tokensInCents = tokens * 1e2
      let cryptoFiatHub = getWeb3ContractInstance(web3, CryptoFiatHub)
      let rawTx = cryptoFiatHub.methods.sellUnpeggedCryptoDollar(tokensInCents)

      let params = {
        from: sender,
        value: value * 10e18,
        gasPrice: gasPrice
      }

      if (!gas) gas = await rawTx.estimateGas(params)
      params.gas = gas

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(actions.sellUnpeggedCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          if (receipt.status === '0x0') {
            dispatch(actions.sellUnpeggedCryptoDollarTxError('The transaction has been reverted', receipt))
          }

          dispatch(actions.sellUnpeggedCryptoDollarTxReceipt(receipt))
        })
        .on('error', error => {
          dispatch(actions.sellUnpeggedCryptoDollarTxError(error.message))
        })
    } catch (error) {
      dispatch(actions.sellUnpeggedCryptoDollarTxError(error.message))
    }
  }
}

export const transferCryptoDollar = ({ amount, receiver, sender, gas, gasPrice }) => {
  return async dispatch => {
    try {
      let web3 = store.getState().web3.web3Instance
      if (typeof web3 === 'undefined') dispatch(actions.transferCryptoDollarTxError())
      if (!sender) throw new Error('Sender Address not provided')
      if (!amount) throw new Error('Token Amount not provided')

      dispatch(actions.transferCryptoDollarTxStarted())

      let amountInCents = amount * 1e2
      let cryptoDollar = getWeb3ContractInstance(web3, CryptoDollar)
      let rawTx = cryptoDollar.methods.transfer(receiver, amountInCents)

      let params = {
        from: sender,
        gasPrice: gasPrice
      }

      if (!gas) gas = await rawTx.estimateGas(params)
      params.gas = gas

      rawTx
        .send(params)
        .on('transactionHash', hash => {
          dispatch(actions.transferCryptoDollarTxSent(hash))
        })
        .on('receipt', receipt => {
          dispatch(actions.transferCryptoDollarTxReceipt(receipt))
        })
        .once('confirmation', confirmation => {
          //
        })
        .on('error', error => {
          console.log(error)
          dispatch(actions.transferCryptoDollarTxError(error.message))
        })
    } catch (error) {
      dispatch(actions.transferCryptoDollarTxError(error.message))
    }
  }
}
