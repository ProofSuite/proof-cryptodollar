import React from 'react'
import { Message } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const ErrorNotification = ({ error }) => (
  <Message negative>
    <Message.Header>Transaction Failed</Message.Header>
      <p>{error}</p>
    </Message>
)

ErrorNotification.propTypes = {
  error: PropTypes.string
}

export default ErrorNotification
