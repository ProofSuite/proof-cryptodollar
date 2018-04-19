import { getProviderUtils } from '../../helpers/web3'
import CryptoDollarInterface from '../../../build/contracts/CryptoDollar.json'
import { getContractInstance } from '../../helpers/contractHelpers'
import { updateCryptoDollarBalances } from '../../actions/cryptoDollarBalancesActions.js'
import { updateEtherBalances } from '../../actions/etherBalancesActions.js'
import { formatEtherColumn, formatCUSDColumn } from '../../helpers/formatHelpers'

export const CRYPTOFIAT_BALANCES_WIDGET_LOADING = 'CRPYTOFIAT_BALANCES_WIDGET_LOADING'
export const CRYPTOFIAT_BALANCES_WIDGET_ERROR = 'CRPYTOFIAT_BALANCES_WIDGET_ERROR'
export const CRYPTOFIAT_BALANCES_WIDGET_UPDATED = 'CRPYTOFIAT_BALANCES_WIDGET_UPDATED'

export const cryptoFiatBalancesWidgetLoading = ({ type: CRYPTOFIAT_BALANCES_WIDGET_LOADING })
export const cryptoFiatBalancesWidgetUpdated = ({ type: CRYPTOFIAT_BALANCES_WIDGET_UPDATED })
export const cryptoFiatBalancesWidgetError = (error) =>
  ({ type: CRYPTOFIAT_BALANCES_WIDGET_ERROR, payload: { error } })

export const queryCryptoFiatBalances = cryptoDollarBalances => async (dispatch, getState) => {
  try {
    dispatch(cryptoFiatBalancesWidgetLoading)

    const provider = getProviderUtils(getState)
    if (typeof web3 === 'undefined') return dispatch(cryptoFiatBalancesWidgetError('could not instantiate web3'))

    let accounts = getState().data.accounts.addresses
    let cryptoDollar = await getContractInstance(CryptoDollarInterface, provider)

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
    dispatch(cryptoFiatBalancesWidgetUpdated)
  } catch (error) {
    return dispatch(cryptoFiatBalancesWidgetError(error.message))
  }
}
