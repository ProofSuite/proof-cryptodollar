import Rewards from '../../../build/contracts/Rewards.json'
import { getProviderUtils } from '../../helpers/web3'
import accounting from 'accounting-js'
import { getContractInstance } from '../../helpers/contractHelpers'

export const QUERYING_REWARDS_STATE = 'QUERYING_REWARDS_STATE'
export const QUERY_REWARDS_STATE_ERROR = 'QUERY_REWARDS_STATE_ERROR'
export const QUERY_REWARDS_STATE_SUCCESS = 'QUERY_REWARDS_STATE_SUCCESS'

export const queryingRewardsContract = () => ({ type: QUERYING_REWARDS_STATE })
export const rewardsContractCallError = (error) => ({ type: QUERY_REWARDS_STATE_ERROR, payload: { error } })
export const rewardsContractCallSuccess = (data) => ({ type: QUERY_REWARDS_STATE_SUCCESS, payload: { data } })

export const queryRewardsContractState = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(queryingRewardsContract())

      let provider = getProviderUtils(getState)
      if (typeof provider.web3 === 'undefined') dispatch(rewardsContractCallError())

      let rewards = getContractInstance(Rewards, provider)
      let rewardsData = await Promise.all([
        rewards.methods.getCurrentPoolIndex().call(),
        rewards.methods.getCurrentEpoch().call(),
        rewards.methods.getCurrentPoolBalance().call()
      ])

      let [currentPoolIndex, currentEpoch, currentPoolBalance] = rewardsData
      let data = {
        currentPoolIndex: currentPoolIndex,
        currentEpoch: currentEpoch,
        currentPoolBalance: accounting.formatMoney(currentPoolBalance / 10e18, { symbol: 'ETH', format: '%v %s' })
      }

      dispatch(rewardsContractCallSuccess(data))
    } catch (error) {
      dispatch(rewardsContractCallError(error.message))
    }
  }
}
