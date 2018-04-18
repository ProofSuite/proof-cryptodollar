import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import TxCreator from '../../tx/TxCreator'
import SellUnpeggedCryptoDollarForm from '../forms/SellUnpeggedCryptoDollarForm'

import {
  signSellUnpeggedCryptoDollarTx,
  validateSellUnpeggedCryptoDollarTx,
  sendSellUnpeggedCryptoDollarTx,
  sendSignedSellUnpeggedCryptoDollarTx
} from '../../../actions/cryptoDollar/sellUnpegged'

import {
  getSellUnpeggedTxStatus,
  getSellUnpeggedTxData
} from '../../../selectors'

class SellUnpeggedCryptoDollarTxForm extends Component {

  render () {
    const {
      sendSellUnpeggedCryptoDollarTx,
      sendSignedSellUnpeggedCryptoDollarTx,
      validateSellUnpeggedCryptoDollarTx,
      signSellUnpeggedCryptoDollarTx,
      txStatus,
      txData
    } = this.props

    const { signature } = txData

    return (
      <TxCreator
      signTx={signSellUnpeggedCryptoDollarTx}
      validateTx={validateSellUnpeggedCryptoDollarTx}
      sendTx={sendSellUnpeggedCryptoDollarTx}
      sendSignedTx={sendSignedSellUnpeggedCryptoDollarTx}
      txSignature={signature}
      >
      {({ validateTx, submitTx }) => (
        <SellUnpeggedCryptoDollarForm
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

SellUnpeggedCryptoDollarTxForm.propTypes = {
  txStatus: PropTypes.object,
  txData: PropTypes.object,
  walletAuthenticationStatus: PropTypes.object,
  sendSellUnpeggedCryptoDollarTx: PropTypes.func,
  sendSignedSellUnpeggedCryptoDollarTx: PropTypes.func,
  validateSellUnpeggedCryptoDollarTx: PropTypes.func,
  signSellUnpeggedCryptoDollarTx: PropTypes.func
}

const mapStateToProps = state => ({
  txStatus: getSellUnpeggedTxStatus(state),
  txData: getSellUnpeggedTxData(state)
})

const mapDispatchToProps = {
  signSellUnpeggedCryptoDollarTx,
  validateSellUnpeggedCryptoDollarTx,
  sendSellUnpeggedCryptoDollarTx,
  sendSignedSellUnpeggedCryptoDollarTx
}

export default connect(mapStateToProps, mapDispatchToProps)(SellUnpeggedCryptoDollarTxForm)
