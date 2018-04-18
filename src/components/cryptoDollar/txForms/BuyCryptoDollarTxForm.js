import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import TxCreator from '../../tx/TxCreator'
import BuyCryptoDollarForm from '../forms/BuyCryptoDollarForm'

import {
  signBuyCryptoDollarTx,
  validateBuyCryptoDollarTx,
  sendBuyCryptoDollarTx,
  sendSignedBuyCryptoDollarTx
} from '../../../actions/cryptoDollar/buy'

import {
  getBuyTxStatus,
  getBuyTxData
} from '../../../selectors'

class BuyCryptoDollarTxForm extends Component {

  render () {
    const {
      sendBuyCryptoDollarTx,
      sendSignedBuyCryptoDollarTx,
      validateBuyCryptoDollarTx,
      signBuyCryptoDollarTx,
      txStatus,
      txData
    } = this.props

    const { signature } = txData

    return (
      <TxCreator
      signTx={signBuyCryptoDollarTx}
      validateTx={validateBuyCryptoDollarTx}
      sendTx={sendBuyCryptoDollarTx}
      sendSignedTx={sendSignedBuyCryptoDollarTx}
      txSignature={signature}
      >
      {({ validateTx, submitTx }) => (
        <BuyCryptoDollarForm
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

BuyCryptoDollarTxForm.propTypes = {
  txStatus: PropTypes.object,
  txData: PropTypes.object,
  walletAuthenticationStatus: PropTypes.object,
  sendBuyCryptoDollarTx: PropTypes.func,
  sendSignedBuyCryptoDollarTx: PropTypes.func,
  validateBuyCryptoDollarTx: PropTypes.func,
  signBuyCryptoDollarTx: PropTypes.func
}

const mapStateToProps = state => ({
  txStatus: getBuyTxStatus(state),
  txData: getBuyTxData(state)
})

const mapDispatchToProps = {
  signBuyCryptoDollarTx,
  validateBuyCryptoDollarTx,
  sendBuyCryptoDollarTx,
  sendSignedBuyCryptoDollarTx
}

export default connect(mapStateToProps, mapDispatchToProps)(BuyCryptoDollarTxForm)
