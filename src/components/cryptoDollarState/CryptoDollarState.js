import React, { Component } from 'react'
import CryptoDollarStateList from './CryptoDollarStateList'
import PropTypes from 'prop-types'

class CryptoDollarState extends Component {
  render () {
    return (
      <div>
        <CryptoDollarStateList contractState={this.props.contractState} />
      </div>
    )
  }
}

CryptoDollarState.propTypes = {
  contractState: PropTypes.object
}

export default CryptoDollarState
