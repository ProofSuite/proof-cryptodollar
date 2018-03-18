
import store from '../../redux-store'
import Accounts from 'web3-eth-accounts'
import Web3 from 'web3'
import CryptoDollarInterface from '../../../build/contracts/CryptoDollar.json'
import { default as Contract } from 'truffle-contract'

const actions = {
  fetchingAddresses: () => ({ type: 'FETCHING_ADDRESSES ' }),
  fetchAddressesSucess: () => ({ type: 'FETCH_ADDRESSES_SUCCESS' }),
  fetchingAccounts: () => ({ type: 'FETCHING_ACCOUNTS' }),
  fetchAccountsSuccess: (payload) => ({ type: 'FETCH_ACCOUNTS_SUCCESS', payload }),
  fetchAccountsError: () => ({ type: 'FETCH_ACCOUNTS_ERROR' })
}

export const fetchAddresses = () => {
  return async dispatch => {
    let accounts, result
    dispatch(actions.fetchingAddresses())

    let web3 = store.getState().web3.web3Instance
    if (typeof web3 !== 'undefined') {
      accounts = new Accounts('ws://localhost:8545')
      result = { accounts }
    } else {
      accounts = new Accounts('ws://localhost:8545')
      result = { accounts }
    }

    dispatch(actions.fetchAddressesSuccess(result))
  }
}

export const fetchAccounts = () => {
  return async dispatch => {
    dispatch(actions.fetchingAccounts())

    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    if (typeof web3 === 'undefined') dispatch(actions.fetchingAccountsError())
    let accounts = await web3.eth.getAccounts()
    let etherBalancesCalls = accounts.map((account) => { return web3.eth.getBalance(account) })
    let etherBalances = await Promise.all(etherBalancesCalls)

    let CryptoDollar = Contract(CryptoDollarInterface)
    CryptoDollar.setProvider(web3.currentProvider)

    CryptoDollar.currentProvider.sendAsync = function () {
      return CryptoDollar.currentProvider.send.apply(CryptoDollar.currentProvider, arguments)
    }

    let cryptoDollar = await CryptoDollar.deployed()

    let cryptoDollarBalancesCalls = accounts.map((account) => {
      return cryptoDollar.balanceOf(account)
    })
    let cryptoDollarBalances = await Promise.all(cryptoDollarBalancesCalls)

    let results = accounts.map((account, i) => {
      return {
        address: account,
        etherBalance: Number(etherBalances[i]),
        cryptoDollarBalance: cryptoDollarBalances[i].toNumber()
      }
    })

    dispatch(actions.fetchAccountsSuccess(results))
  }
}

export const fetchAccountsWithoutWebsockets = () => {
  return async dispatch => {
    dispatch(actions.fetchingAccounts())

    let web3 = store.getState().web3.web3Instance
    if (typeof web3 === 'undefined') dispatch(actions.fetchingAccountsError())

    let accounts = await web3.eth.getAccounts()
    let etherBalancesCalls = accounts.map((account) => { return web3.eth.getBalance(account) })
    let etherBalances = await Promise.all(etherBalancesCalls)

    let CryptoDollar = Contract(CryptoDollarInterface)
    CryptoDollar.setProvider(web3.currentProvider)

    CryptoDollar.currentProvider.sendAsync = function () {
      return CryptoDollar.currentProvider.send.apply(CryptoDollar.currentProvider, arguments)
    }

    let cryptoDollar = await CryptoDollar.deployed()

    let cryptoDollarBalancesCalls = accounts.map((account) => {
      return cryptoDollar.balanceOf(account)
    })
    let cryptoDollarBalances = await Promise.all(cryptoDollarBalancesCalls)

    let results = accounts.map((account, i) => {
      return {
        address: account,
        etherBalance: Number(etherBalances[i]),
        cryptoDollarBalance: cryptoDollarBalances[i].toNumber()
      }
    })

    dispatch(actions.fetchAccountsSuccess(results))
  }
}
