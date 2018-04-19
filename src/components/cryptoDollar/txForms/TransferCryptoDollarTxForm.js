import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import TxCreator from '../../tx/TxCreator'
import TransferCryptoDollarForm from '../forms/TransferCryptoDollarForm'

import {
  signTransferCryptoDollarTx,
  validateTransferCryptoDollarTx,
  sendTransferCryptoDollarTx,
  sendSignedTransferCryptoDollarTx
} from '../../../actions/cryptoDollar/transfer'

import {
  getTransferTxStatus,
  getTransferTxData
} from '../../../selectors'

class TransferCryptoDollarTxForm extends Component {

  render () {
    const {
      sendTransferCryptoDollarTx,
      sendSignedTransferCryptoDollarTx,
      validateTransferCryptoDollarTx,
      signTransferCryptoDollarTx,
      txStatus,
      txData
    } = this.props

    const { signature } = txData

    return (
      <TxCreator
      signTx={signTransferCryptoDollarTx}
      validateTx={validateTransferCryptoDollarTx}
      sendTx={sendTransferCryptoDollarTx}
      sendSignedTx={sendSignedTransferCryptoDollarTx}
      txSignature={signature}
      >
      {({ validateTx, submitTx }) => (
        <TransferCryptoDollarForm
          validateTx={validateTx}
          submitTx={submitTx}
          txData={txData}
          txStatus={txStatus}
        />
      )}
    </TxCreator>
    )
  }
}

TransferCryptoDollarTxForm.propTypes = {
  txStatus: PropTypes.object,
  txData: PropTypes.object,
  walletAuthenticationStatus: PropTypes.object,
  sendTransferCryptoDollarTx: PropTypes.func,
  sendSignedTransferCryptoDollarTx: PropTypes.func,
  validateTransferCryptoDollarTx: PropTypes.func,
  signTransferCryptoDollarTx: PropTypes.func
}

const mapStateToProps = state => ({
  txStatus: getTransferTxStatus(state),
  txData: getTransferTxData(state)
})

const mapDispatchToProps = {
  signTransferCryptoDollarTx,
  validateTransferCryptoDollarTx,
  sendTransferCryptoDollarTx,
  sendSignedTransferCryptoDollarTx
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferCryptoDollarTxForm)
