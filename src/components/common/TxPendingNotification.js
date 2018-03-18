import React from 'react'
import { Message, Loader } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const TxPendingNotification = ({ receipt, txHash }) => (
  <Message color='green'>
    <Message.Header>Your transaction has been sent!</Message.Header>
    <p>Transaction Hash: {txHash}</p>
    <Loader active inline='centered' indeterminate>Transaction Pending</Loader>
  </Message>
)

TxPendingNotification.propTypes = {
  receipt: PropTypes.object,
  txHash: PropTypes.string
}

export default TxPendingNotification
