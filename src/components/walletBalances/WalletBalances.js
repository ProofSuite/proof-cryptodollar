import React, { PureComponent } from 'react'
import WalletBalancesTable from './WalletBalancesTable'
import PropTypes from 'prop-types'

class WalletBalances extends PureComponent {

  render () {
    if (this.props.balances.length) {
      return (
        <WalletBalancesTable balances={this.props.balances} />
      )
    } else {
      return null
    }
  }
}

WalletBalances.propTypes = {
  balances: PropTypes.array
}

export default WalletBalances
