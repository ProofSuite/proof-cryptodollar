import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import Accounts from './components/accounts/Accounts'
import DeployedContracts from './components/deployedContracts/DeployedContracts'
import CryptoDollarState from './components/cryptoDollarState/CryptoDollarState'
// import contract from 'truffle-contract'

class App extends Component {
  constructor (props) {
    super(props)
  }

  render () {

    const accounts = [
      {
        address: "0x0123",
        ethereumBalance: 1231,
        cryptoDollarBalance: 123,
      },
      {
        address: "0x0123",
        ethereumBalance: 1231,
        cryptoDollarBalance: 123,
      },
      {
        address: "0x0123",
        ethereumBalance: 1231,
        cryptoDollarBalance: 123,
      },
      {
        address: "0x0123",
        ethereumBalance: 1231,
        cryptoDollarBalance: 123,
      },
      {
        address: "0x0123",
        ethereumBalance: 1231,
        cryptoDollarBalance: 123,
      }
    ]

    const contracts = [
      {
        "name": "cryptoDollar",
        "address": "0x123",
      },
      {
        "name": "store",
        "address": "01235",
      },
      {
        "name": "cryptoFiatHub",
        "address": "0x01234"
      },
      {
        "name": "rewards",
        "address": "0x3453"
      }
    ]

    const contractState = [
      {
        "name": "Total Supply",
        "value": 10000
      },
      {
        "name": "Contract Balance",
        "value": 1000000
      },
      {
        "name": "Buffer",
        "value": 10000
      },
      {
        "name": "Outstanding Value",
        "value": 100000
      }
    ]

    return (
      <div className='App'>
        <Accounts accounts={accounts} />
        <DeployedContracts contracts={contracts} />
        <CryptoDollarState contractState={contractState} />
      </div>
    )
  }
}

export default App
