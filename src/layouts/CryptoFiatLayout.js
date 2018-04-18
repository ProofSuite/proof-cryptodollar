import React, { Component } from 'react'
import { connect } from 'react-redux'
import AccountBalancesContainer from '../components/accountBalances/AccountBalancesContainer'
import WalletBalancesContainer from '../components/walletBalances/WalletBalancesContainer'
import CryptoDollarContainer from '../components/cryptoDollar/CryptoDollarContainer'
import ContractAddressesWidgetContainer from '../components/contractAddresses/ContractAddressesWidgetContainer'
import RewardsFormContainer from '../components/rewards/RewardsContainer'
import PropTypes from 'prop-types'
import LoaderLayout from './LoaderLayout'

import { queryAccounts } from '../actions/accountActions'
import { queryWalletBalances } from '../components/walletBalances/actions'

import styles from './CryptoFiatLayout.css'

class CryptoFiatLayout extends Component {

  state = {
    renderLoading: true
  }

  componentWillMount () {
    this.props.queryAccounts()
    this.props.queryWalletBalances()
  }

  renderCryptoFiatLayout () {
    return (
      <div className={styles.app}>
          <div className={styles.cryptoDollar}>
            <CryptoDollarContainer />
          </div>
          <div className={styles.rewards}>
            <RewardsFormContainer />
          </div>
          <div className={styles.accountBalances}>
            <AccountBalancesContainer />
          </div>
          <div className={styles.walletBalances}>
          <WalletBalancesContainer />
        </div>
        <div className={styles.contractAddresses}>
          <ContractAddressesWidgetContainer />
        </div>
      </div>
    )
  }

  renderLoading () {
    return <LoaderLayout />
  }

  componentWillReceiveProps (newProps) {
    let { web3Loading, web3Error, accountsLoading } = newProps
    let loading = web3Loading || web3Error || accountsLoading
    this.setState({ loading })
  }

  render () {
    return (
      <div>
      {
        this.state.loading
        ? this.renderLoading()
        : this.renderCryptoFiatLayout()
      }
      </div>

    )
  }
  }

const mapStateToProps = state => ({
  web3Loading: state.data.web3.loading,
  web3Error: state.data.web3.error,
  accountsLoading: state.data.accounts.status.loading
})

const mapDispatchToProps = {
  queryAccounts,
  queryWalletBalances
}

CryptoFiatLayout.propTypes = {
  web3Loading: PropTypes.bool,
  web3Error: PropTypes.string,
  accountsLoading: PropTypes.bool,
  queryAccounts: PropTypes.func,
  queryWalletBalances: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(CryptoFiatLayout)
