import { connect } from 'react-redux'
import RewardsForm from './ui/RewardsForm'
import { fetchRewardsContractState, withdrawRewards } from './rewardsActions'

const mapStateToProps = (state) => {
  console.log(state)
  return {
    contractState: state.rewards.contractState,
    withdraw: state.rewards.withdraw
  }
}

const mapDispatchToProps = { fetchRewardsContractState, withdrawRewards }

export default connect(mapStateToProps, mapDispatchToProps)(RewardsForm)
