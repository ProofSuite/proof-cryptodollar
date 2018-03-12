import React, { Component } from 'react'
import AddressesList from './AddressesList'
import EthereumBalancesList from './EthereumBalancesList'
import CryptoDollarBalancesList from './CryptoDollarBalancesList'

class Accounts extends Component {

  constructor(props) {
    super(props)
    console.log(this.props.accounts.map(elem => { return elem.address }))
  }

  addresses() {
    return this.props.accounts.map(elem => { return elem.address })
  }

  ethereumBalances() {
    return this.props.accounts.map(elem => { return elem.ethereumBalance })
  }

  cryptoDollarBalances() {
    return this.props.accounts.map(elem => { return elem.cryptoDollarBalance })
  }

  render() {
    return(
      <div>
        <AddressesList addresses={this.addresses()} />
        <EthereumBalancesList balances={this.ethereumBalances()} />
        <CryptoDollarBalancesList balances={this.cryptoDollarBalances()} />
      </div>
    )
  }
}

export default Accounts

