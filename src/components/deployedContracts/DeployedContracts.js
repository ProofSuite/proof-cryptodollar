
import React, { Component } from 'react'
import DeployedContractsList from './DeployedContractsList'
import PropTypes from 'prop-types'

class DeployedContracts extends Component {
  render () {
    return (
      <div>
        <DeployedContractsList contracts={this.props.contracts} />
      </div>
    )
  }
}

DeployedContracts.propTypes = {
  contracts: PropTypes.object
}

export default DeployedContracts
