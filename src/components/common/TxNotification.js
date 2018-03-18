import React, { Component } from 'react'
import { Loader, Dimmer } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import TxSuccessNotification from './TxSucessNotification'
import TxErrorNotification from './TxErrorNotification'
import TxPendingNotification from './TxPendingNotification'

class TxNotification extends Component {

  renderErrorNotification (error, txHash, receipt) {
    return <TxErrorNotification error={error} txHash={txHash} receipt={receipt} />
  }

  renderLoader () {
    return (
      <Dimmer active inverted>
        <Loader active inverted>Loading</Loader>
      </Dimmer>
    )
  }

  renderTxPendingNotification (txHash) {
    return <TxPendingNotification txHash={txHash} />
  }

  renderTxSuccessNotification (txHash, receipt) {
    return <TxSuccessNotification txHash={txHash} receipt={receipt} />
  }

  render () {
    const { loading, error, txHash, receipt } = this.props

    if (error) {
      return this.renderErrorNotification(error, txHash, receipt)
    } else if (loading) {
      return this.renderLoader()
    } else if (txHash && !receipt) {
      return this.renderTxPendingNotification(txHash)
    } else if (txHash && receipt) {
      return this.renderTxSuccessNotification(txHash, receipt)
    } else {
      return null
    }
  }
}

TxNotification.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  txHash: PropTypes.string,
  receipt: PropTypes.object
}

export default TxNotification
