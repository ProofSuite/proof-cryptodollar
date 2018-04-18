import React, { PureComponent } from 'react'
import AccountBalancesTable from './AccountBalancesTable'
import PropTypes from 'prop-types'

class AccountBalances extends PureComponent {

  componentDidMount (props) {
    this.props.queryAccountBalances()
  }

  render () {
    if (this.props.balances.length) {
      return (
        <AccountBalancesTable balances={this.props.balances} />
      )
    } else {
      return null
    }
  }
}

AccountBalances.propTypes = {
  balances: PropTypes.array,
  queryAccountBalances: PropTypes.func
}

export default AccountBalances
