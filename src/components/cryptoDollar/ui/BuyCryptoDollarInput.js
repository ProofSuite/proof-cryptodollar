import React, { Component } from 'react'
import { Header, Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import GasSettings from '../../common/GasSettings'
import TxNotification from '../../common/TxNotification'

class BuyCryptoDollarInput extends Component {
  state = { value: '', gas: '', gasPrice: '', sender: '' }

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value })
  }

  handleSubmit = () => {
    const { value, gas, gasPrice, sender } = this.state
    this.props.buyCryptoDollar({ sender, value, gas, gasPrice })
  }

  render () {
    const { value, gas, gasPrice, sender } = this.state
    const { loading, error, receipt, txHash } = this.props.status

    return (
      <div>
        <Header as='h2'>Buy CryptoDollar</Header>
        <Form onSubmit={this.handleSubmit} color='black'>
            <Form.Input
              placeholder='Message value'
              name='value'
              value={value}
              onChange={this.handleChange}
            />
            <Form.Input
              placeholder='Sender'
              name='sender'
              value={sender}
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

BuyCryptoDollarInput.propTypes = {
  buyCryptoDollar: PropTypes.func,
  status: PropTypes.object
}

export default BuyCryptoDollarInput
