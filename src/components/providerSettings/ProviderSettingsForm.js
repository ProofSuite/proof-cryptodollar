import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Button, Radio, Switch, Select } from 'antd'

class ProviderSettings extends Component {

  state = {
    loading: false,
    expand: false
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.disableButton()
    this.props.form.validateFields((err, values) => {
      if (err) console.log(err)
      this.props.setCustomProvider(values)
    })
  }

  onProviderChange = (e) => {
    this.setState({ expand: e.target.value === 'custom' })
  }

  disableButton = () => {
    this.setState({ loading: true })
    setTimeout(() => { this.setState({ loading: false }) }, 3000)
  }

  renderCustomProviderForm () {
    const { getFieldDecorator } = this.props.form

    return (
      <div>
      <Form.Item label='Provider Type'>
        {getFieldDecorator('type')(
          <Radio.Group>
            <Radio style={radioStyle} value='metamask'>Metamask</Radio>
            <Radio style={radioStyle} value='local'>Local</Radio>
            <Radio style={radioStyle} value='remote'>Remote</Radio>
            <Radio style={radioStyle} value='infura'>Infura</Radio>
          </Radio.Group>
        )}
        </Form.Item>
        <Form.Item label='Websockets Support'>
          {getFieldDecorator('websockets', { valuePropName: 'websockets' })(
            <Switch />
          )}
        </Form.Item>
        <Form.Item label='Network ID' hasFeedback>
          {getFieldDecorator('networkID')(
            <Select
              showSearch
              placeholder='Select a network ID'>
              <Select.Option value='1'>1 (Mainnet)</Select.Option>
              <Select.Option value='2'>2 (Ropsten)</Select.Option>
              <Select.Option value='3'>3 (Rinkeby)</Select.Option>
              <Select.Option value='4'>4 (?)</Select.Option>
              <Select.Option value='1000'>1000 (Local Default TestRPC)</Select.Option>
              <Select.Option value='8888'>8888 (Local Default Geth)</Select.Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item label='Provider URL'>
          {getFieldDecorator('url')(
            <Input placeholder='Provider URL' />
          )}
        </Form.Item>
      </div>
    )
  }

  render () {
    const { getFieldDecorator } = this.props.form

    return (
        <Form onSubmit={this.handleSubmit} color='black'>
          <Form.Item label='Choose Provider'>
          {getFieldDecorator('provider')(
            <Radio.Group onChange={this.onProviderChange}>
              <Radio style={radioStyle} value='metamask'>Default Metamask Provider</Radio>
              <Radio style={radioStyle} value='local'>Default Local Geth Provider</Radio>
              <Radio style={radioStyle} value='infura'>Default Infura Provider</Radio>
              <Radio style={radioStyle} value='infura (rinkeby)'>Default Infura Provider (Rinkeby)</Radio>
              <Radio style={radioStyle} value='custom'>Custom Provider</Radio>
            </Radio.Group>
          )}
          </Form.Item>
          {this.state.expand ? this.renderCustomProviderForm() : null}
          <Button type='primary' htmlType='submit' loading={this.state.loading}>
              Change Provider
          </Button>
        </Form>
    )
  }
}

ProviderSettings.propTypes = {
  form: PropTypes.object,
  setCustomProvider: PropTypes.func
}

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px'
}

const ProviderSettingsForm = Form.create()(ProviderSettings)

export default ProviderSettingsForm
