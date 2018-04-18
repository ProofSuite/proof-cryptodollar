import React, { Component } from 'react'
import { Header, Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import GasSettings from '../common/GasSettings'
import ErrorNotification from '../common/ErrorNotification'

class WithdrawRewardsForm extends Component {
  state = { gas: '', gasPrice: '' }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  handleSubmit = () => {
    const { gas, gasPrice } = this.state
    this.props.withdrawRewards({ gas, gasPrice })
  }

  render () {
    const { gas, gasPrice } = this.state
    const { error } = this.props

    return (
      <div>
        <Header as='h2'>Withdraw Rewards</Header>
        <Form onSubmit={this.handleSubmit} color='black'>
            Withdraw your rewards by clicking the button below
            <GasSettings
              gas={gas}
              gasPrice={gasPrice}
              handleChange={this.handleChange}
            />
            { error && <ErrorNotification error={error} /> }
          <Form.Button content='Send Transaction' inverted color='green' fluid/>
        </Form>
      </div>
    )
  }
}

WithdrawRewardsForm.propTypes = {
  withdrawRewards: PropTypes.func,
  error: PropTypes.string
}

export default WithdrawRewardsForm
