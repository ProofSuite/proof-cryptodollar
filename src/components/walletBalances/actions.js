import { getProviderUtils } from '../../helpers/web3'
import CryptoDollarInterface from '../../../build/contracts/CryptoDollar.json'
import { getContractInstance } from '../../helpers/contractHelpers'
import { updateCryptoDollarBalances } from '../../actions/cryptoDollarBalancesActions'
import { updateEtherBalances } from '../../actions/etherBalancesActions'
import { formatEtherColumn, formatCUSDColumn } from '../../helpers/formatHelpers'

export const WALLET_BALANCES_LOADING = 'WALLET_BALANCES_LOADING'
export const WALLET_BALANCES_UPDATED = 'WALLET_BALANCES_UPDATED'
export const WALLET_BALANCES_ERROR = 'WALLET_BALANCES_ERROR'

export const walletBalancesLoading = () => ({ type: WALLET_BALANCES_LOADING })
export const walletBalancesUpdated = () => ({ type: WALLET_BALANCES_UPDATED })
export const walletBalancesError = (error) => ({ type: WALLET_BALANCES_ERROR, payload: { error } })

export const queryWalletBalances = walletBalances => async (dispatch, getState) => {
  try {
    dispatch(walletBalancesLoading())
    const provider = getProviderUtils(getState)
    console.log(provider)
    if (typeof provider.web3 === 'undefined') return dispatch(walletBalancesError('Could not instantiate web3'))

    let wallets = getState().data.wallets.allAddresses
    console.log('here is the provider', provider)
    let cryptoDollar = getContractInstance(CryptoDollarInterface, provider)

    let cryptoDollarBalancesCalls = wallets.map((wallet) => cryptoDollar.methods.balanceOf(wallet).call())
    let reservedEtherBalancesCalls = wallets.map((wallet) => cryptoDollar.methods.reservedEther(wallet).call())
    let etherBalancesCalls = wallets.map((wallet) => provider.web3.eth.getBalance(wallet))

    let cryptoDollarBalances = await Promise.all(cryptoDollarBalancesCalls)
    let reservedEtherBalances = await Promise.all(reservedEtherBalancesCalls)
    let etherBalances = await Promise.all(etherBalancesCalls)

    cryptoDollarBalances = formatCUSDColumn(cryptoDollarBalances)
    reservedEtherBalances = formatEtherColumn(reservedEtherBalances)
    etherBalances = formatEtherColumn(etherBalances)

    let formattedCryptoDollarBalances = wallets.map((wallet, i) => {
      return {
        address: wallet,
        cryptoDollarBalance: cryptoDollarBalances[i],
        reservedEtherBalance: reservedEtherBalances[i]
      }
    })

    let formattedEtherBalances = wallets.map((wallet, i) => {
      return {
        address: wallet,
        etherBalance: etherBalances[i]
      }
    })

    dispatch(updateCryptoDollarBalances(formattedCryptoDollarBalances))
    dispatch(updateEtherBalances(formattedEtherBalances))
    dispatch(walletBalancesUpdated())
  } catch (error) {
    console.log(error)
    return dispatch(walletBalancesError(error.message))
  }
}
