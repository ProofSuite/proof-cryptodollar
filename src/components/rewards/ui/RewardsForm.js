import React, { Component } from 'react'
import RewardsContractState from './RewardsContractState'
import WithdrawRewardsTab from './WithdrawRewardsTab'
import PropTypes from 'prop-types'
import { Tab } from 'semantic-ui-react'

class RewardsForm extends Component {

  componentDidMount (props) {
    this.props.fetchRewardsContractState()
  }

  renderContractState = () => {
    const { error, data } = this.props.contractState
    return (
      <Tab.Pane attached={false}>
        <RewardsContractState
          error={error}
          data={data}
        />
      </Tab.Pane>
    )
  }

  renderWithdrawRewardsTab = () => {
    const { error, withdrawRewards } = this.props.withdraw
    return (
      <Tab.Pane attached={false}>
        <WithdrawRewardsTab
          error={error}
          withdrawRewards={withdrawRewards}
        />
      </Tab.Pane>
    )
  }

  render () {
    const panes = [
      { menuItem: 'Contract State', render: this.renderContractState },
      { menuItem: 'Withdraw Rewards', render: this.renderWithdrawRewardsTab }
    ]

    return (
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    )
  }
}

RewardsForm.propTypes = {
  contractState: PropTypes.object,
  withdraw: PropTypes.object,
  fetchRewardsContractState: PropTypes.func,
  withdrawRewards: PropTypes.func
}

export default RewardsForm
