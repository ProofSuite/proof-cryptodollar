import { connect } from 'react-redux'
import Rewards from './Rewards'

import { queryRewardsContractState } from '../../actions/rewards/queryContractState'
import { getRewardsContractState } from '../../selectors'

const mapStateToProps = (state) => {
  return {
    contractState: getRewardsContractState(state)
  }
}

const mapDispatchToProps = {
  queryRewardsContractState
}

export default connect(mapStateToProps, mapDispatchToProps)(Rewards)
