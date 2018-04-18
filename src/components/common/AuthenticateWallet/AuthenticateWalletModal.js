import React, { Component } from 'react'
import { Modal, Button, Icon } from 'antd'
import PropTypes from 'prop-types'
import AuthenticateWalletForm from './AuthenticateWalletForm'

import styled from 'styled-components'

class AuthenticateWalletModal extends Component {

  renderAuthenticateWalletForm = () => {
    return <AuthenticateWalletForm updatePassword={this.props.updatePassword} />
  }

  renderWalletAuthenticatedSuccessfully = () => {
    return (
      <SuccessfulAuthenticationMessage>
        <div>
          <Icon type='check-circle' style={{ fontSize: 60, color: 'green' }} />
        </div>
        <p style={{ fontSize: 26 }}>Wallet successfully authenticated!</p>
      </SuccessfulAuthenticationMessage>
    )
  }

  componentWillUnmount = () => {
    console.log('unmounting')
    this.props.unAuthenticateWallet()
  }

  render () {
    const { visible,
            hideModal,
            authenticated,
            authenticating,
            authenticateWallet,
            sendSignedTx } = this.props

    return (
      <Modal
        title='Authenticate Wallet'
        visible={visible}
        onOk={hideModal}
        onCancel={hideModal}
        width={800}
        footer={[
          <Button
            key='Cancel'
            onClick={hideModal}>
              Cancel
          </Button>,
          <Button
            key={authenticating ? 'Authenticating Wallet' : 'Authenticate Wallet'}
            onClick={authenticateWallet}
            disabled={authenticated}
            loading={authenticating}
            >
              {authenticating ? 'Authenticating Wallet' : 'Authenticate Wallet'}
          </Button>,
          <Button
            key='Send Transaction'
            onClick={sendSignedTx}
            disabled={!authenticated}
            type='primary'
          >
            Send Transaction
          </Button>
        ]}
      >
      {!authenticated && this.renderAuthenticateWalletForm()}
      {authenticated && this.renderWalletAuthenticatedSuccessfully()}
      </Modal>
    )
  }
}

const SuccessfulAuthenticationMessage = styled.div`
  display: flex;
  height: 250px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

AuthenticateWalletModal.propTypes = {
  visible: PropTypes.bool,
  hideModal: PropTypes.func,
  sendSignedTx: PropTypes.func,
  authenticateWallet: PropTypes.func,
  updatePassword: PropTypes.func,
  authenticating: PropTypes.bool,
  authenticated: PropTypes.bool,
  unAuthenticateWallet: PropTypes.func
}

export default AuthenticateWalletModal
