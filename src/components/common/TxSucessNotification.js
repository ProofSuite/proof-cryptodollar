import React from 'react'
import { Message } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import TransactionReceipt from './TransactionReceipt'

const TxSuccessNotification = ({ receipt, txHash }) => (
  <Message color='green'>
    <Message.Header>Your transaction was successfully sent!</Message.Header>
      <p>Transaction Hash: {txHash}</p>
      <TransactionReceipt receipt={receipt} />
    </Message>
)

TxSuccessNotification.propTypes = {
  receipt: PropTypes.object,
  txHash: PropTypes.string
}

export default TxSuccessNotification
