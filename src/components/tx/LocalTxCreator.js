import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

class LocalTxCreator extends PureComponent {

  render () {
    const { validateTx, sendTx } = this.props
    return (
      <React.Fragment>
      {this.props.children({
        validateTx,
        submitTx: sendTx
      })}
      </React.Fragment>
    )
  }
}

LocalTxCreator.propTypes = {
  children: PropTypes.func,
  validateTx: PropTypes.func,
  sendTx: PropTypes.func
}

export default LocalTxCreator
