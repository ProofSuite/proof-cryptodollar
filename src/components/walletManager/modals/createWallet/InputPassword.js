import React, { Component } from 'react'
import { Form, Input, Icon } from 'antd'
import PropTypes from 'prop-types'

import styled from 'styled-components'

class InputPasswordForm extends Component {
  render () {
    const { getFieldDecorator } = this.props.form
    const { updatePassword } = this.props

    return (
      <InputPasswordFormContainer>
        <em>Input a secure password that will be used to encrypt your wallet</em>
        <Form layout='vertical'>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Input a password to secure your wallet' }]
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
      </InputPasswordFormContainer>
    )
  }
}

const InputPasswordFormContainer = styled.div`
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  width: 500px;
  margin: auto;
`

const InputPassword = Form.create()(InputPasswordForm)

InputPasswordForm.propTypes = {
  form: PropTypes.object,
  getFieldDecorator: PropTypes.func,
  updatePassword: PropTypes.func,
  showEncryptionProgress: PropTypes.bool,
  encryptionPercentage: PropTypes.number
}

export default InputPassword
