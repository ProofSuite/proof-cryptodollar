import React, { Component } from 'react'
import { Header, Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import GasSettings from '../../common/GasSettings'
import TxNotification from '../../common/TxNotification'
import TxValidityNotification from '../../common/TxValidityNotification'

class TransferCryptoDollarForm extends Component {
  state = { sender: '', receiver: '', amount: '', gas: '', gasPrice: '' }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value }, () => {
      let { sender, receiver, amount, gas, gasPrice } = this.state
      if (sender && receiver && amount) {
        this.props.validateTx({ amount, sender, receiver, gas, gasPrice, value })
      }
    })
  }

  handleSubmit = () => {
    let { sender, receiver, amount, gas, gasPrice } = this.state
    let { requiredGas } = this.props.txData

    gas = gas || requiredGas
    this.props.submitTx({ amount, receiver, sender, gas, gasPrice })
  }

  render () {
    const { amount, receiver, gas, gasPrice, sender } = this.state
    const { txLoading, txError } = this.props.txStatus
    const { status, statusMessage, requiredGas, hash, receipt } = this.props.txData

    return (
      <div>
        <Header as='h2'>Transfer CryptoDollar CryptoDollar</Header>
        <Form onSubmit={this.handleSubmit} color='black'>
            <Form.Input
              placeholder='Transfer Amount'
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
            <TxValidityNotification
              status={status}
              requiredGas={requiredGas}
              statusMessage={statusMessage}
            />
            <GasSettings
              gas={gas}
              requiredGas={requiredGas}
              gasPrice={gasPrice}
              handleChange={this.handleChange}
            />
            <TxNotification
              loading={txLoading}
              error={txError}
              hash={hash}
              receipt={receipt}
            />
          <Form.Button content='Send Transaction' inverted color='green' fluid/>
        </Form>
      </div>
    )
  }
}

TransferCryptoDollarForm.propTypes = {
  sendTx: PropTypes.func,
  submitTx: PropTypes.func,
  validateTx: PropTypes.func,
  txStatus: PropTypes.object,
  txData: PropTypes.object
}

export default TransferCryptoDollarForm
