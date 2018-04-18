import { getProviderUtils } from '../helpers/web3'
import { getERC20Instance } from '../helpers/contractHelpers'
import { formatCUSDColumn } from '../helpers/formatHelpers'

export const TOKEN_BALANCES_LOADING = 'TOKEN_BALANCES_LOADING'
export const TOKEN_BALANCES_ERROR = 'TOKEN_BALANCES_ERROR'
export const UPDATE_TOKEN_BALANCE = 'UPDATE_TOKEN_BALANCE'
export const UPDATE_TOKEN_BALANCES = 'UPDATE_TOKEN_BALANCES'
export const DELETE_TOKEN_BALANCE = 'DELETE_TOKEN_BALANCE'

export const tokenBalancesLoading = () => ({
  type: TOKEN_BALANCES_LOADING })
export const tokenBalancesError = () => ({
  type: TOKEN_BALANCES_ERROR })
export const updateTokenBalance = (address, cryptoDollarBalance) => ({
  type: UPDATE_TOKEN_BALANCE,
  payload: { address, cryptoDollarBalance }
})
export const deleteTokenBalance = address => ({
  type: DELETE_TOKEN_BALANCE, payload: { address }
})
export const updateTokenBalances = tokenBalances => ({
  type: UPDATE_TOKEN_BALANCES,
  payload: { tokenBalances }
})

export const queryTokenBalances = (...tokenAddresses) => async (dispatch, getState) => {
  try {
    dispatch(tokenBalancesLoading())
    const provider = getProviderUtils(getState)
    if (typeof provider.web3 === 'undefined') return dispatch(tokenBalancesError())

    let accounts = getState().accounts.addresses

    // create a 2D-array of balances[tokens][accounts]
    let tokenBalancesPromises = tokenAddresses.map(tokenAddress => {
      let erc20 = getERC20Instance(provider.web3, tokenAddress)
      let tokenBalances = accounts.map(account => {
        let balancePromise = erc20.methods.balanceOf(account).call()
        return balancePromise
      })
      return tokenBalances
    })

    let tokenBalances = await Promise.all(tokenBalancesPromises.map(Promise.all))
    let formattedTokenBalances = tokenBalances.map(balances => {
      return formatCUSDColumn(balances)
    })

    let results = accounts.map((account, i) => {
      return {
        address: account,
        tokenBalances: formattedTokenBalances[account]
      }
    })

    dispatch(updateTokenBalances(results))
  } catch (error) {
    dispatch(tokenBalancesError())
  }
}
