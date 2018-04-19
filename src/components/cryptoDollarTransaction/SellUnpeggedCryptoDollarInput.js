import React, { Component } from 'react'
import { Header, Form, Segment } from 'semantic-ui-react'

class SellUnpeggedCryptoDollarInput extends Component {
  constructor (props) {
    super(props)
    this.state = { tokens: '', gas: '', gasPrice: '', from: '', value: '' }
  }

  handleChange (e, { field, value }) {
    this.setState({ [field]: value })
  }

  handleSubmit () {
    const { tokens, gas, gasPrice, sender, value } = this.state
    console.log(tokens, gas, gasPrice, sender, value)
  }

  render () {
    const { tokens, gas, gasPrice, sender, value } = this.state
    return (
      <div>
        <Segment>
        <Header as='h2' color='red'>SELL UNPEGGED CRYPTODOLLAR</Header>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Input placeholder='Number of Tokens' name='value' value={tokens} onChange={this.handleChange} />
            <Form.Input placeholder='Gas' name='gas' value={gas} onChange={this.handleChange} />
            <Form.Input placeholder='Gas Price' name='gasPrice' value={gasPrice} onChange={this.handleChange} />
            <Form.Input placeholder='Sender' name='sender' value={sender} onChange={this.handleChange} />
            <Form.Input placeholder='Message value' name='value' value={value} onChange={this.handleChange} />
            <Form.Button content='Submit' />
          </Form.Group>
        </Form>
        </Segment>
      </div>
    )
  }
}

export default SellUnpeggedCryptoDollarInput
