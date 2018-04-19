import React, { PureComponent } from 'react'
import ContractAddressesCard from './ContractAddressesCard'
import PropTypes from 'prop-types'

class ContractAddressesWidget extends PureComponent {

  componentDidMount (props) {
    this.props.queryContractAddresses()
  }

  render () {
    let { loading, contractAddresses } = this.props
    let { contracts } = contractAddresses

    if (loading || contractAddresses.loading || !contracts) {
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

ContractAddressesWidget.propTypes = {
  loading: PropTypes.bool,
  contractAddresses: PropTypes.object,
  queryContractAddresses: PropTypes.func
}

export default ContractAddressesWidget
