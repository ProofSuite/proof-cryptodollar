import React, { Component } from 'react'
import { Header, Form, Segment, Container } from 'semantic-ui-react'

class BuyCryptoDollarInput extends Component {
  constructor (props) {
    super(props)
    this.state = { value: '', gas: '', gasPrice: '', from: '' }
  }

  handleChange (e, { field, value }) {
    this.setState({ [field]: value })
  }

  handleSubmit () {
    const { value, gas, gasPrice, sender } = this.state
    console.log(value, gas, gasPrice, sender)
  }

  render () {
    const { value, gas, gasPrice, sender } = this.state
    return (
      <div>
          <Segment>
          <Header as='h2'>BUY CRYPTODOLLAR</Header>
          <Form onSubmit={this.handleSubmit}>
            <Form.Group>
              <Form.Input placeholder='Message value' name='value' value={value} onChange={this.handleChange} />
              <Form.Input placeholder='Gas' name='gas' value={gas} onChange={this.handleChange} />
              <Form.Input placeholder='Gas Price' name='gasPrice' value={gasPrice} onChange={this.handleChange} />
              <Form.Input placeholder='Sender' name='sender' value={sender} onChange={this.handleChange} />
              <Form.Button content='Submit' />
            </Form.Group>
          </Form>
          </Segment>
      </div>
    )
  }
}

export default BuyCryptoDollarInput
