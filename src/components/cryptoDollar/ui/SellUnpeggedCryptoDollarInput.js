import React, { Component } from 'react'
import { Header, Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import GasSettings from '../../common/GasSettings'
import TxNotification from '../../common/TxNotification'

class SellUnpeggedCryptoDollarInput extends Component {
  state = { tokens: '', gas: '', gasPrice: '', from: '', value: '' }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  handleSubmit = () => {
    const { tokens, gas, gasPrice, sender, value } = this.state
    this.props.sellUnpeggedCryptoDollar({ tokens, sender, value, gas, gasPrice })
  }

  render () {
    const { tokens, gas, gasPrice, sender, value } = this.state
    const { error, receipt, txHash, loading } = this.props.status

    return (
      <div>
          <Header as='h2'>Sell CryptoDollar (unpegged)</Header>
          <Form onSubmit={this.handleSubmit}>
              <Form.Input
                placeholder='Number of Tokens'
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
              <Form.Input
                placeholder='Message value'
                name='value'
                value={value}
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

SellUnpeggedCryptoDollarInput.propTypes = {
  sellUnpeggedCryptoDollar: PropTypes.func,
  status: PropTypes.object
}

export default SellUnpeggedCryptoDollarInput
