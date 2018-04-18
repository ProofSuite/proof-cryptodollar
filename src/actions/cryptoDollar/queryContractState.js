import CryptoFiatHub from '../../../build/contracts/CryptoFiatHub.json'
import CryptoDollar from '../../../build/contracts/CryptoDollar.json'
import { getContractInstance } from '../../helpers/contractHelpers'
import { formatEtherColumn } from '../../helpers/formatHelpers'
import { getProviderUtils } from '../../helpers/web3'

export const QUERYING_CRYPTODOLLAR_STATE = 'QUERYING_CRYPTODOLLAR_STATE'
export const QUERY_CRYPTODOLLAR_STATE_SUCCESS = 'QUERY_CRYPTODOLLAR_STATE_SUCCESS'
export const QUERY_CRYPTODOLLAR_STATE_ERROR = 'QUERY_CRYPTODOLLAR_STATE_ERROR'

export const queryingCryptoDollarState = () => (
  { type: QUERYING_CRYPTODOLLAR_STATE }
)
export const queryCryptoDollarStateSuccess = data => ({
  type: QUERY_CRYPTODOLLAR_STATE_SUCCESS,
  payload: { data }
})
export const queryCryptoDollarStateError = error =>
({ type: QUERY_CRYPTODOLLAR_STATE_ERROR,
  payload: { error }
})

export const queryCryptoDollarContractState = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(queryingCryptoDollarState())

      let provider = getProviderUtils(getState)
      if (typeof provider.web3 === 'undefined') return dispatch(queryCryptoDollarStateError('could not instantiate web3'))

      let cryptoDollar = getContractInstance(CryptoDollar, provider)
      let cryptoFiatHub = getContractInstance(CryptoFiatHub, provider)
      let exchangeRate = 87537

      let contractData = await Promise.all([
        cryptoDollar.methods.totalSupply().call(),
        cryptoFiatHub.methods.totalOutstanding(exchangeRate).call(),
        cryptoFiatHub.methods.buffer(exchangeRate).call(),
        cryptoFiatHub.methods.contractBalance().call()
      ])

      let [totalSupply, totalOutstanding, buffer, contractBalance] = formatEtherColumn(contractData)
      let data = { totalSupply, totalOutstanding, buffer, contractBalance }
      dispatch(queryCryptoDollarStateSuccess(data))
    } catch (error) {
      dispatch(queryCryptoDollarStateError(error.message))
    }
  }
}
