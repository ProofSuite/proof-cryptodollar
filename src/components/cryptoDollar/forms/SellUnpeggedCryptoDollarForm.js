import React, { Component } from 'react'
import { Header, Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import GasSettings from '../../common/GasSettings'
import TxNotification from '../../common/TxNotification'
import TxValidityNotification from '../../common/TxValidityNotification'

class SellUnpeggedCryptoDollarForm extends Component {
  state = { tokens: '', gas: '', gasPrice: '', sender: '' }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value }, () => {
      let { sender, gas, gasPrice, tokens } = this.state
      if (sender && tokens) {
        this.props.validateTx({ sender, gas, gasPrice, tokens })
      }
    })
  }

  handleSubmit = () => {
    let { tokens, gas, gasPrice, sender } = this.state
    let { requiredGas } = this.props.txData

    gas = gas || requiredGas
    this.props.submitTx({ sender, tokens, gas, gasPrice })
  }

  render () {
    const { tokens, gas, gasPrice, sender } = this.state
    const { txLoading, txError } = this.props.txStatus
    const { status, statusMessage, requiredGas, hash, receipt } = this.props.txData

    return (
      <div>
        <Header as='h2'>Sell CryptoDollar (unpegged)</Header>
        <Form onSubmit={this.handleSubmit} color='black'>
            <Form.Input
              placeholder='Number of tokens'
              name='tokens'
              value={tokens}
              onChange={this.handleChange}
            />
            <Form.Input
              placeholder='Sender'
              name='sender'
              value={sender}
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

SellUnpeggedCryptoDollarForm.propTypes = {
  sendTx: PropTypes.func,
  submitTx: PropTypes.func,
  validateTx: PropTypes.func,
  txStatus: PropTypes.object,
  txData: PropTypes.object
}

export default SellUnpeggedCryptoDollarForm
