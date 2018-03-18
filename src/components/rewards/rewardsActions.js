import store from '../../redux-store'
import Rewards from '../../../build/contracts/Rewards.json'
import { getWeb3ContractInstance } from '../../helpers/contractHelpers'
import { resolve } from 'catchify'

const actions = {
  callingRewardsContract: () => ({ type: 'CALL_REWARDS_CONTRACT' }),
  rewardsContractCallError: () => ({ type: 'CALL_REWARDS_CONTRACT_ERROR' }),
  rewardsContractCallSuccess: data => ({ type: 'CALL_REWARDS_CONTRACT_SUCCESS', payload: data }),
  withdrawingRewards: () => ({ type: 'WITHDRAWING_REWARDS' }),
  withdrawRewardsSuccess: (receipt) => ({ type: 'WITHDRAW_REWARDS_SUCCESS', payload: receipt }),
  withdrawRewardsError: (error) => ({ type: 'WITHDRAW_REWARDS_ERROR', payload: error })
}

export const fetchRewardsContractState = () => {
  return async dispatch => {
    try {
      dispatch(actions.callingRewardsContract())

      let web3 = store.getState().web3.web3Instance
      if (typeof web3 === 'undefined') dispatch(actions.rewardsContractCallError())

      let rewards = getWeb3ContractInstance(web3, Rewards)

      let data = {}
      data.currentPoolIndex = await rewards.methods.getCurrentPoolIndex().call()
      data.currentEpoch = await rewards.methods.getCurrentEpoch().call()
      data.currentPoolBalance = await rewards.methods.getCurrentPoolBalance().call()
      console.log('I am fetching rewards data')
      console.log(data)
      dispatch(actions.rewardsContractCallSuccess(data))
    } catch (error) {
      console.log(error)
      dispatch(actions.rewardsContractCallError(error))
    }
  }
}

export const withdrawRewards = ({ sender }) => {
  return async dispatch => {
    try {
      dispatch(actions.withdrawingRewards())

      let web3 = store.getState().web3.web3Instance
      if (typeof web3 === 'undefined') throw new Error('Provider not found')

      let rewards = getWeb3ContractInstance(web3, Rewards)
      let rawTx = rewards.methods.withdrawRewards()
      let [error, receipt] = await resolve(rawTx.send({ from: sender }))
      if (error) throw new Error(error.message)

      dispatch(actions.withdrawRewardsSuccess(receipt))
    } catch (e) {
      dispatch(actions.withdrawRewardsError(e.message))
    }
  }
}
