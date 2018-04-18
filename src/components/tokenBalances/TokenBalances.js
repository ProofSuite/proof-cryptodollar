import React, { Component } from 'react'
import TokenBalancesTable from './TokenBalancesTable'
import PropTypes from 'prop-types'

class TokenBalances extends Component {

  componentDidMount (props) {
    this.props.fetchTokenBalances()
  }

  render () {
    if (this.props.tokenBalances.length) {
      return (
        <TokenBalancesTable accounts={this.props.tokenBalances} />
      )
    } else {
      return (
        <TokenBalancesTable accounts={this.props.tokenBalances} />
      )
    }
  }
}

TokenBalances.propTypes = {
  tokenBalances: PropTypes.array,
  fetchTokenBalances: PropTypes.func
}

export default TokenBalances
