
import React, { Component } from 'react'
import DeployedContractsList from './DeployedContractsList'

export default class DeployedContracts extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <DeployedContractsList contracts={this.props.contracts} />
      </div>
    )
  }
}
