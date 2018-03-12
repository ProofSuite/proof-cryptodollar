import React, { Component } from 'react'
import AccountTable from './AccountTable'
import PropTypes from 'prop-types'

class Accounts extends Component {
  render () {
    return (
        <AccountTable accounts={this.props.accounts} />
    )
  }
}

Accounts.propTypes = {
  accounts: PropTypes.object
}

export default Accounts

