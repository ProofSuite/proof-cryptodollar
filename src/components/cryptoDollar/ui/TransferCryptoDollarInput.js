import React, { Component } from 'react'
import { Header, Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import GasSettings from '../../common/GasSettings'
import TxNotification from '../../common/TxNotification'

class TransferCryptoDollarInput extends Component {

  state = { sender: '', receiver: '', amount: '', gas: '', gasPrice: '' }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  handleSubmit = () => {
    const { sender, receiver, amount, gas, gasPrice } = this.state
    this.props.transferCryptoDollar({ amount, receiver, sender, gas, gasPrice })
  }

  render () {
    const { amount, receiver, sender, gas, gasPrice } = this.state
    const { error, receipt, txHash, loading } = this.props.status

    return (
      <div>
        <Header as='h2'>Transfer CryptoDollar</Header>
        <Form onSubmit={this.handleSubmit}>
            <Form.Input
              placeholder='Message amount'
              name='amount'
              value={amount}
              onChange={this.handleChange}
            />
            <Form.Input
              placeholder='Sender'
              name='sender'
              value={sender}
              onChange={this.handleChange}
            />
            <Form.Input
              placeholder='Receiver'
              name='receiver'
              value={receiver}
              onChange={this.handleChange}
            />
            <GasSettings
              gas={gas}
              gasPrice={gasPrice}
              handleChange={this.handleChange}
            />
            <TxNotification
              loading={loading}
              error={error}
              txHash={txHash}
              receipt={receipt}
            />
          <Form.Button content='Send Transaction' inverted color='green' fluid/>
        </Form>
      </div>
    )
  }
}

TransferCryptoDollarInput.propTypes = {
  transferCryptoDollar: PropTypes.func,
  status: PropTypes.object
}

export default TransferCryptoDollarInput
