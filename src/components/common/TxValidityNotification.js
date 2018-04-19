import React, { PureComponent } from 'react'
import { Header } from 'semantic-ui-react'
import PropTypes from 'prop-types'

class TxValidityNotification extends PureComponent {

  renderInvalidTx (requiredGas, statusMessage) {
    return (
      <Header as='h4' color='red'>{statusMessage}
        {requiredGas && `- Required Gas: ${requiredGas}`}
       </Header>
    )
  }

  renderValidTx (requiredGas, statusMessage) {
    return (
      <Header as='h4' color='green'>{statusMessage} - (Required Gas: {requiredGas})</Header>
    )
  }

  render () {
    const { status, statusMessage, requiredGas } = this.props
    if (status === 'invalid') {
      return this.renderInvalidTx(requiredGas, statusMessage)
    } else if (status === 'valid') {
      return this.renderValidTx(requiredGas, statusMessage)
    } else {
      return null
    }
  }
}

TxValidityNotification.propTypes = {
  status: PropTypes.string,
  requiredGas: PropTypes.number,
  statusMessage: PropTypes.string
}

export default TxValidityNotification
