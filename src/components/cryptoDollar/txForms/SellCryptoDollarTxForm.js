import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import TxCreator from '../../tx/TxCreator'
import SellCryptoDollarForm from '../forms/SellCryptoDollarForm'

import {
  signSellCryptoDollarTx,
  validateSellCryptoDollarTx,
  sendSellCryptoDollarTx,
  sendSignedSellCryptoDollarTx
} from '../../../actions/cryptoDollar/sell'

import {
  getSellTxStatus,
  getSellTxData
} from '../../../selectors'

class SellCryptoDollarTxForm extends Component {

  render () {
    const {
      sendSellCryptoDollarTx,
      sendSignedSellCryptoDollarTx,
      validateSellCryptoDollarTx,
      signSellCryptoDollarTx,
      txStatus,
      txData
    } = this.props

    const { signature } = txData

    return (
      <TxCreator
      signTx={signSellCryptoDollarTx}
      validateTx={validateSellCryptoDollarTx}
      sendTx={sendSellCryptoDollarTx}
      sendSignedTx={sendSignedSellCryptoDollarTx}
      txSignature={signature}
      >
      {({ validateTx, submitTx }) => (
        <SellCryptoDollarForm
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

SellCryptoDollarTxForm.propTypes = {
  txStatus: PropTypes.object,
  txData: PropTypes.object,
  walletAuthenticationStatus: PropTypes.object,
  sendSellCryptoDollarTx: PropTypes.func,
  sendSignedSellCryptoDollarTx: PropTypes.func,
  validateSellCryptoDollarTx: PropTypes.func,
  signSellCryptoDollarTx: PropTypes.func
}

const mapStateToProps = state => ({
  txStatus: getSellTxStatus(state),
  txData: getSellTxData(state)
})

const mapDispatchToProps = {
  signSellCryptoDollarTx,
  validateSellCryptoDollarTx,
  sendSellCryptoDollarTx,
  sendSignedSellCryptoDollarTx
}

export default connect(mapStateToProps, mapDispatchToProps)(SellCryptoDollarTxForm)
