import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import TxCreator from '../tx/TxCreator'
import WithdrawRewardsForm from './WithdrawRewardsForm'

import {
  signWithdrawRewardsTx,
  validateWithdrawRewardsTx,
  sendWithdrawRewardsTx,
  sendSignedWithdrawRewardsTx
} from '../../actions/rewards/withdraw'

import {
  getWithdrawRewardsTxStatus,
  getWithdrawRewardsTxData
} from '../../selectors'

class WithdrawRewardsTxForm extends Component {

  render () {
    const {
      sendWithdrawRewardsTx,
      sendSignedWithdrawRewardsTx,
      validateWithdrawRewardsTx,
      signWithdrawRewardsTx,
      txStatus,
      txData
    } = this.props

    const { signature } = txData

    return (
      <TxCreator
      signTx={signWithdrawRewardsTx}
      validateTx={validateWithdrawRewardsTx}
      sendTx={sendWithdrawRewardsTx}
      sendSignedTx={sendSignedWithdrawRewardsTx}
      txSignature={signature}
      >
      {({ validateTx, submitTx }) => (
        <WithdrawRewardsForm
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

WithdrawRewardsTxForm.propTypes = {
  txStatus: PropTypes.object,
  txData: PropTypes.object,
  walletAuthenticationStatus: PropTypes.object,
  sendWithdrawRewardsTx: PropTypes.func,
  sendSignedWithdrawRewardsTx: PropTypes.func,
  validateWithdrawRewardsTx: PropTypes.func,
  signWithdrawRewardsTx: PropTypes.func
}

const mapStateToProps = state => ({
  txStatus: getWithdrawRewardsTxStatus(state),
  txData: getWithdrawRewardsTxData(state)
})

const mapDispatchToProps = {
  signWithdrawRewardsTx,
  validateWithdrawRewardsTx,
  sendWithdrawRewardsTx,
  sendSignedWithdrawRewardsTx
}

export default connect(mapStateToProps, mapDispatchToProps)(WithdrawRewardsTxForm)
