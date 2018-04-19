import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import AuthenticateWalletModal from '../common/AuthenticateWallet/AuthenticateWalletModal'

class InfuraTxCreator extends PureComponent {

  state = {
    value: '',
    gas: '',
    gasPrice: '',
    sender: '',
    showAuthenticateWalletModal: false,
    password: ''
  }

  updatePassword = (e) => {
    this.setState({ password: e.target.value })
  }

  showAuthenticateWalletModal = () => {
    this.setState({ showAuthenticateWalletModal: true })
  }

  hideAuthenticateWalletModal = () => {
    this.setState({ showAuthenticateWalletModal: false })
  }

  authenticateWallet = () => {
    const { password, value, gas, gasPrice } = this.state
    const { wallet } = this.props
    this.props.signTx(wallet, password, { value, gas, gasPrice })
  }

  submitTx = ({ sender, value, gas, gasPrice }) => {
    this.setState({ sender, value, gas, gasPrice })
    this.showAuthenticateWalletModal()
  }

  sendSignedTx = () => {
    const { txSignature } = this.props
    this.props.sendSignedTx(txSignature)
    this.hideAuthenticateWalletModal()
  }

  render () {
    const { authenticating, authenticated, authenticationError } = this.props.walletAuthentication
    const { validateTx, txValid, txStatus, unAuthenticateWallet } = this.props

    return (
      <React.Fragment>
      {this.props.children({
        validateTx,
        txValid,
        txStatus,
        submitTx: this.submitTx
      })}
      <AuthenticateWalletModal
        visible={this.state.showAuthenticateWalletModal}
        hideModal={this.hideAuthenticateWalletModal}
        authenticateWallet={this.authenticateWallet}
        authenticated={authenticated}
        authenticating={authenticating}
        authenticationError={authenticationError}
        unAuthenticateWallet={unAuthenticateWallet}
        sendSignedTx={this.sendSignedTx}
        updatePassword={this.updatePassword}
         />
      </React.Fragment>
    )
  }
}

InfuraTxCreator.propTypes = {
  signTx: PropTypes.func,
  sendSignedTx: PropTypes.func,
  validateTx: PropTypes.func,
  txStatus: PropTypes.object,
  txValid: PropTypes.bool,
  txSignature: PropTypes.string,
  children: PropTypes.func,
  wallet: PropTypes.object,
  walletAuthentication: PropTypes.object,
  unAuthenticateWallet: PropTypes.func
}

export default InfuraTxCreator

