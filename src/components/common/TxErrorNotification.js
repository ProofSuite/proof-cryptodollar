import React from 'react'
import { Message } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import TransactionReceipt from './TransactionReceipt'

const TxErrorNotification = ({ error, txHash, receipt }) => (
  <Message negative>
    <Message.Header>Transaction Failed</Message.Header>
      <p>{error}</p>
      {receipt && <TransactionReceipt receipt={receipt} />}
    </Message>
)

TxErrorNotification.propTypes = {
  error: PropTypes.string,
  txHash: PropTypes.string,
  receipt: PropTypes.object
}

export default TxErrorNotification
