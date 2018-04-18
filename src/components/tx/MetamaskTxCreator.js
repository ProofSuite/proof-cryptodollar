import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

class MetamaskTxCreator extends PureComponent {

  render () {
    const { validateTx, sendTx } = this.props

    return (
      <React.Fragment>
      {this.props.children({
        validateTx: validateTx,
        submitTx: sendTx
      })
      }
      </React.Fragment>
    )
  }
}

MetamaskTxCreator.propTypes = {
  children: PropTypes.object,
  validateTx: PropTypes.func,
  sendTx: PropTypes.func
}

export default MetamaskTxCreator
