import React, { Component } from 'react'
import ContractAddressesCard from './ContractAddressesCard'
import PropTypes from 'prop-types'

class ContractAddresses extends Component {

  componentDidMount (props) {
    this.props.fetchContractAddresses()
  }

  render () {
    const { isFetching, contracts } = this.props.contractAddresses

    if (isFetching || !contracts) {
      return (
        <div>Loading</div>
      )
    } else {
      return (
        <ContractAddressesCard contracts={contracts} />
      )
    }
  }
}

ContractAddresses.propTypes = {
  contractAddresses: PropTypes.object,
  fetchContractAddresses: PropTypes.func
}

export default ContractAddresses
