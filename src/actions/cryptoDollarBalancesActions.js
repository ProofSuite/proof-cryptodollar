import { getProviderUtils } from '../helpers/web3'
import CryptoDollarInterface from '../../build/contracts/CryptoDollar.json'
import { formatCUSDColumn, formatEtherColumn } from '../helpers/formatHelpers'
import { getContractInstance } from '../helpers/contractHelpers'

export const CRYPTODOLLAR_BALANCES_LOADING = 'CRYPTODOLLAR_BALANCES_LOADING'
export const CRYPTODOLLAR_BALANCE_ERROR = 'CRYPTODOLLAR_BALANCE_ERROR'
export const UPDATE_CRYPTODOLLAR_BALANCE = 'UPDATE_CRYPTODOLLAR_BALANCE'
export const UPDATE_CRYPTODOLLAR_BALANCES = 'UPDATE_CRYPTODOLLAR_BALANCES'
export const DELETE_CRYPTODOLLAR_BALANCE = 'DELETE_CRYPTODOLLAR_BALANCE'

export const cryptoDollarBalancesLoading = () =>
  ({ type: CRYPTODOLLAR_BALANCES_LOADING })

export const cryptoDollarBalancesError = () =>
  ({ type: CRYPTODOLLAR_BALANCE_ERROR })

export const updateCryptoDollarBalance = (address, cryptoDollarBalance) => ({
  type: UPDATE_CRYPTODOLLAR_BALANCE,
  payload: { address, cryptoDollarBalance }
})
export const deleteCryptoDollarBalance = address => ({
  type: DELETE_CRYPTODOLLAR_BALANCE,
  payload: { address }
})
export const updateCryptoDollarBalances = cryptoDollarBalances => ({
  type: UPDATE_CRYPTODOLLAR_BALANCES,
  payload: { cryptoDollarBalances }
})

export const queryCryptoDollarBalances = cryptoDollarBalances => async (dispatch, getState) => {
  try {
    cryptoDollarBalancesLoading()
    const provider = getProviderUtils(getState)
    if (typeof provider.web3 === 'undefined') return cryptoDollarBalancesError()

    let accounts = getState().accounts.addresses
    let cryptoDollar = await getContractInstance(CryptoDollarInterface, provider)

    let cryptoDollarBalancesCalls = accounts.map(account =>
      cryptoDollar.methods.balanceOf(account).call()
    )
    let reservedEtherBalancesCalls = accounts.map(account =>
      cryptoDollar.methods.reservedEther(account).call()
    )
    let cryptoDollarBalances = await Promise.all(cryptoDollarBalancesCalls)
    let reservedEtherBalances = await Promise.all(reservedEtherBalancesCalls)

    cryptoDollarBalances = formatCUSDColumn(cryptoDollarBalances)
    reservedEtherBalances = formatEtherColumn(reservedEtherBalances)

    let formattedBalances = accounts.map((account, i) => {
      return {
        address: account,
        cryptoDollarBalance: cryptoDollarBalances[i],
        reservedEtherBalance: reservedEtherBalances[i]
      }
    })
    updateCryptoDollarBalances(formattedBalances)
  } catch (error) {
    cryptoDollarBalancesError()
  }
}
