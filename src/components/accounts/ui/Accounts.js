import React, { Component } from 'react'
import AccountTable from './AccountTable'
import PropTypes from 'prop-types'

class Accounts extends Component {

  componentDidMount (props) {
    this.props.fetchAccounts()
  }

  render () {
    if (this.props.accounts.length) {
      return (
        <AccountTable accounts={this.props.accounts} />
      )
    } else {
      return (
        <AccountTable accounts={this.props.accounts} />
      )
    }
  }
}

Accounts.propTypes = {
  accounts: PropTypes.array,
  fetchAccounts: PropTypes.func
}

export default Accounts
