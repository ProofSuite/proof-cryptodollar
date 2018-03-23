import Web3 from 'web3'
import CryptoDollar from '../../../build/contracts/CryptoDollar.json'
import { getWeb3ContractInstance } from '../../helpers/contractHelpers'
import { formatEtherColumn, formatCUSDColumn } from '../../helpers/formatHelpers'

const actions = {
  fetchingAddresses: () => ({ type: 'FETCHING_ADDRESSES ' }),
  fetchAddressesSucess: () => ({ type: 'FETCH_ADDRESSES_SUCCESS' }),
  fetchingAccounts: () => ({ type: 'FETCHING_ACCOUNTS' }),
  fetchAccountsSuccess: (payload) => ({ type: 'FETCH_ACCOUNTS_SUCCESS', payload }),
  fetchAccountsError: () => ({ type: 'FETCH_ACCOUNTS_ERROR' })
}

export const fetchAccounts = () => {
  return async dispatch => {
    dispatch(actions.fetchingAccounts())

    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    if (typeof web3 === 'undefined') dispatch(actions.fetchingAccountsError())
    let accounts = await web3.eth.getAccounts()

    let cryptoDollar = getWeb3ContractInstance(web3, CryptoDollar)

    let etherBalancesCalls = accounts.map((account) => web3.eth.getBalance(account))
    let etherBalances = await Promise.all(etherBalancesCalls)
    etherBalances = formatEtherColumn(etherBalances)

    let cryptoDollarBalancesCalls = accounts.map((account) => cryptoDollar.methods.balanceOf(account).call())
    let cryptoDollarBalances = await Promise.all(cryptoDollarBalancesCalls)
    cryptoDollarBalances = formatCUSDColumn(cryptoDollarBalances)

    let reservedEtherCalls = accounts.map((account) => cryptoDollar.methods.reservedEther(account).call())
    let reservedEtherBalances = await Promise.all(reservedEtherCalls)
    reservedEtherBalances = formatEtherColumn(reservedEtherBalances)

    let results = accounts.map((account, i) => {
      return {
        address: account,
        etherBalance: etherBalances[i],
        cryptoDollarBalance: cryptoDollarBalances[i],
        reservedEtherBalance: reservedEtherBalances[i]
      }
    })

    dispatch(actions.fetchAccountsSuccess(results))
  }
}
