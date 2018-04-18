import React, { PureComponent } from 'react'
import { Loader, Dimmer } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import TxSuccessNotification from './TxSucessNotification'
import TxErrorNotification from './TxErrorNotification'
import TxPendingNotification from './TxPendingNotification'

class TxNotification extends PureComponent {

  renderErrorNotification (error, hash, receipt) {
    return <TxErrorNotification error={error} hash={hash} receipt={receipt} />
  }

  renderLoader () {
    return (
      <Dimmer active inverted>
        <Loader active inverted>Loading</Loader>
      </Dimmer>
    )
  }

  renderTxPendingNotification (hash) {
    return <TxPendingNotification hash={hash} />
  }

  renderTxSuccessNotification (hash, receipt) {
    return <TxSuccessNotification hash={hash} receipt={receipt} />
  }

  render () {
    const { loading, error, hash, receipt } = this.props

    if (error) {
      return this.renderErrorNotification(error, hash, receipt)
    } else if (loading) {
      return this.renderLoader()
    } else if (hash && !receipt) {
      return this.renderTxPendingNotification(hash)
    } else if (hash && receipt) {
      return this.renderTxSuccessNotification(hash, receipt)
    } else {
      return null
    }
  }
}

TxNotification.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.string,
  hash: PropTypes.string,
  receipt: PropTypes.object
}

export default TxNotification
