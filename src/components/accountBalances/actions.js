import { getProviderUtils } from '../../helpers/web3'
import CryptoDollarInterface from '../../../build/contracts/CryptoDollar.json'
import { getContractInstance } from '../../helpers/contractHelpers'
import { updateCryptoDollarBalances } from '../../actions/cryptoDollarBalancesActions.js'
import { updateEtherBalances } from '../../actions/etherBalancesActions.js'
import { formatEtherColumn, formatCUSDColumn } from '../../helpers/formatHelpers'

export const ACCOUNT_BALANCES_LOADING = 'ACCOUNT_BALANCES_LOADING'
export const ACCOUNT_BALANCES_UPDATED = 'ACCOUNT_BALANCES_UPDATED'
export const ACCOUNT_BALANCES_ERROR = 'ACCOUNT_BALANCES_ERROR'

export const accountBalancesLoading = () => ({ type: ACCOUNT_BALANCES_LOADING })
export const accountBalancesUpdated = () => ({ type: ACCOUNT_BALANCES_UPDATED })
export const accountBalancesError = (error) => ({ type: ACCOUNT_BALANCES_ERROR, payload: { error } })

export const queryAccountBalances = accountBalances => async (dispatch, getState) => {
  try {
    dispatch(accountBalancesLoading())

    const provider = getProviderUtils(getState)
    if (typeof provider.web3 === 'undefined') return dispatch(accountBalancesError('Could not instantiate web3'))

    let accounts = getState().data.accounts.addresses
    let cryptoDollar = getContractInstance(CryptoDollarInterface, provider)
    let cryptoDollarBalancesCalls = accounts.map((account) => cryptoDollar.methods.balanceOf(account).call())
    let reservedEtherBalancesCalls = accounts.map((account) => cryptoDollar.methods.reservedEther(account).call())
    let etherBalancesCalls = accounts.map((account) => provider.web3.eth.getBalance(account))

    let cryptoDollarBalances = await Promise.all(cryptoDollarBalancesCalls)
    let reservedEtherBalances = await Promise.all(reservedEtherBalancesCalls)
    let etherBalances = await Promise.all(etherBalancesCalls)

    cryptoDollarBalances = formatCUSDColumn(cryptoDollarBalances)
    reservedEtherBalances = formatEtherColumn(reservedEtherBalances)
    etherBalances = formatEtherColumn(etherBalances)

    let formattedCryptoDollarBalances = accounts.map((account, i) => {
      return {
        address: account,
        cryptoDollarBalance: cryptoDollarBalances[i],
        reservedEtherBalance: reservedEtherBalances[i]
      }
    })

    let formattedEtherBalances = accounts.map((account, i) => {
      return {
        address: account,
        etherBalance: etherBalances[i]
      }
    })

    dispatch(updateCryptoDollarBalances(formattedCryptoDollarBalances))
    dispatch(updateEtherBalances(formattedEtherBalances))
    dispatch(accountBalancesUpdated())
  } catch (error) {
    return dispatch(accountBalancesError(error.message))
  }
}
