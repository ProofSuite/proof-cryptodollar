import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { getProvider, getDefaultWallet, getWalletAuthenticationStatus } from '../../selectors'
import PropTypes from 'prop-types'
import { unAuthenticateWallet } from '../../actions/walletActions'

import MetamaskTxCreator from './MetamaskTxCreator'
import InfuraTxCreator from './InfuraTxCreator'
import LocalTxCreator from './LocalTxCreator'

class TxCreator extends PureComponent {
  render () {
    const {
      provider,
      signTx,
      sendSignedTx,
      validateTx,
      sendTx,
      defaultWallet,
      txSignature,
      walletAuthentication
    } = this.props

    switch (provider.type) {
      case 'metamask':
        return (
          <MetamaskTxCreator validateTx={validateTx} sendTx={sendTx}>
            {this.props.children}
          </MetamaskTxCreator>
        )
      case 'local':
        return (
          <LocalTxCreator validateTx={validateTx} sendTx={sendTx}>
            {this.props.children}
          </LocalTxCreator>
        )
      case 'infura':
        return (
          <InfuraTxCreator
            signTx={signTx}
            validateTx={validateTx}
            sendSignedTx={sendSignedTx}
            wallet={defaultWallet}
            walletAuthentication={walletAuthentication}
            txSignature={txSignature}
            unAuthenticateWallet={unAuthenticateWallet}
          >
            {this.props.children}
          </InfuraTxCreator>
        )
      default:
        return (
          <InfuraTxCreator
            signTx={signTx}
            validateTx={validateTx}
            sendSignedTx={sendSignedTx}
            wallet={defaultWallet}
            walletAuthentication={walletAuthentication}
            txSignature={txSignature}
          >
            {this.props.children}
          </InfuraTxCreator>
        )
    }
  }
}

const mapDispatchToProps = {
  unAuthenticateWallet
}

const mapStateToProps = state => {
  return {
    provider: getProvider(state),
    defaultWallet: getDefaultWallet(state),
    walletAuthentication: getWalletAuthenticationStatus(state)
  }
}

TxCreator.propTypes = {
  signTx: PropTypes.func,
  validateTx: PropTypes.func,
  sendTx: PropTypes.func,
  sendSignedTx: PropTypes.func,
  provider: PropTypes.object,
  txSignature: PropTypes.string,
  defaultWallet: PropTypes.object,
  walletAuthentication: PropTypes.object,
  unAuthenticateWallet: PropTypes.func,
  children: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(TxCreator)
