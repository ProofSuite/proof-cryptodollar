import React, { Component } from 'react'
import RewardsContractState from './RewardsContractState'
import WithdrawRewardsTxForm from './WithdrawRewardsTxForm'
import PropTypes from 'prop-types'
import { Tab } from 'semantic-ui-react'

class Rewards extends Component {

  componentDidMount (props) {
    this.props.queryRewardsContractState()
  }

  renderContractState = () => {
    return (
      <Tab.Pane attached={false}>
        <RewardsContractState
          {...this.props.contractState}
        />
      </Tab.Pane>
    )
  }

  renderWithdrawRewardsTxForm = () => {
    return (
      <Tab.Pane attached={false}>
        <WithdrawRewardsTxForm />
      </Tab.Pane>
    )
  }

  render () {
    const panes = [
      { menuItem: 'Contract State', render: this.renderContractState },
      { menuItem: 'Withdraw Rewards', render: this.renderWithdrawRewardsTxForm }
    ]

    return (
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    )
  }
}

Rewards.propTypes = {
  contractState: PropTypes.object,
  queryRewardsContractState: PropTypes.func
}

export default Rewards
