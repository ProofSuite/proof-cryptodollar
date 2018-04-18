import React, { PureComponent } from 'react'
import CryptoFiatBalancesTable from './CryptoFiatBalancesTable'
import PropTypes from 'prop-types'

class CryptoFiatBalances extends PureComponent {

  componentDidMount (props) {
    this.props.queryCryptoFiatBalances()
  }

  render () {
    if (this.props.balances.length) {
      return (
        <CryptoFiatBalancesTable balances={this.props.balances} />
      )
    } else {
      return (
        <CryptoFiatBalancesTable balances={this.props.balances} />
      )
    }
  }
}

CryptoFiatBalances.propTypes = {
  balances: PropTypes.array,
  queryCryptoFiatBalances: PropTypes.func
}

export default CryptoFiatBalances
