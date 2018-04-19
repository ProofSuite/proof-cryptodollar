import React, { Component } from 'react'
import { Form, Input, Icon } from 'antd'
import PropTypes from 'prop-types'

import styled from 'styled-components'

class AuthenticateWallet extends Component {
  render () {
    const { getFieldDecorator } = this.props.form
    const { updatePassword } = this.props

    return (
      <FormContainer>
        <em>Input the password used to encrypt your wallet</em>
        <Form layout='vertical'>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Unlock Wallet' }]
            })(
              <Input
                prefix={<Icon type='lock' />}
                type='password'
                placeholder='Password'
                onChange={updatePassword}
              />
            )}
          </Form.Item>
          <a className='login-form-forgot' href=''>Learn how to secure your wallet</a>
        </Form>
      </FormContainer>
    )
  }
}

const FormContainer = styled.div`
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  width: 500px;
  margin: auto;
`

const AuthenticateWalletForm = Form.create()(AuthenticateWallet)

AuthenticateWallet.propTypes = {
  form: PropTypes.object,
  getFieldDecorator: PropTypes.func,
  updatePassword: PropTypes.func
}

export default AuthenticateWalletForm
