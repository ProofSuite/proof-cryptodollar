import React, { Component } from 'react'
import getWeb3 from '../utils/getWeb3'
import { hot } from 'react-hot-loader'
import Accounts from '../components/accounts/Accounts'
import DeployedContracts from '../components/deployedContracts/DeployedContracts'
import CryptoDollarState from '../components/cryptoDollarState/CryptoDollarState'
import CryptoDollarInterface from '../components/cryptoDollarTransaction/CryptoDollarInterface'

import 'semantic-ui-css/semantic.min.css?global'
import styles from './App.css'

class App extends Component {
  render () {
    const accounts = [
      {
        address: '0x0123',
        etherBalance: 1231,
        cryptoDollarBalance: 123
      },
      {
        address: '0x0123',
        etherBalance: 1231,
        cryptoDollarBalance: 123
      },
      {
        address: '0x0123',
        etherBalance: 1231,
        cryptoDollarBalance: 123
      },
      {
        address: '0x0123',
        etherBalance: 1231,
        cryptoDollarBalance: 123
      },
      {
        address: '0x0123',
        etherBalance: 1231,
        cryptoDollarBalance: 123
      }
    ]

    const contracts = [
      {
        'name': 'cryptoDollar',
        'address': '0x123'
      },
      {
        'name': 'store',
        'address': '01235'
      },
      {
        'name': 'cryptoFiatHub',
        'address': '0x01234'
      },
      {
        'name': 'rewards',
        'address': '0x3453'
      }
    ]

    const contractState = [
      {
        'name': 'Total Supply',
        'value': 10000
      },
      {
        'name': 'Contract Balance',
        'value': 1000000
      },
      {
        'name': 'Buffer',
        'value': 10000
      },
      {
        'name': 'Outstanding Value',
        'value': 100000
      }
    ]

    return (
      <div className={styles.app}>
        <Accounts accounts={accounts} />
        <div className={styles.contractsInformation}>
          <DeployedContracts contracts={contracts} />
          <CryptoDollarState contractState={contractState} />
        </div>
        <CryptoDollarInterface />
      </div>
    )
  }
}

export default hot(module)(App)
