import React, { Component } from 'react'
import { connect } from 'react-redux'
import AccountsContainer from '../components/accounts/AccountsContainer'
import CryptoDollarContainer from '../components/cryptoDollar/CryptoDollarContainer'
import ContractAddressesContainer from '../components/contractAddresses/ContractAddressesContainer'
import RewardsFormContainer from '../components/rewards/rewardsFormContainer'
import PropTypes from 'prop-types'

import { initializeWeb3 } from '../services/web3/web3Actions.js'
import 'semantic-ui-css/semantic.min.css?global'
import styles from './CryptoFiatLayout.css'

class CryptoFiat extends Component {
  componentDidMount () {
    this.props.initializeWeb3({ websockets: true })
  }

  renderApplication () {
    return (
      <div className={styles.app}>
        <CryptoDollarContainer />
        <RewardsFormContainer />
        <AccountsContainer />
        <ContractAddressesContainer />
      </div>
    )
  }

  renderLoading () {
    return <div className={styles.app}>Loading</div>
  }

  render () {
    if (this.props.web3Instance) {
      return this.renderApplication()
    } else {
      return this.renderLoading()
    }
  }
}

const mapStateToProps = state => ({
  web3Instance: state.web3.web3Instance
})

const mapDispatchToProps = {
  initializeWeb3
}

CryptoFiat.propTypes = {
  initializeWeb3: PropTypes.func,
  web3Instance: PropTypes.object
}

export default connect(mapStateToProps, mapDispatchToProps)(CryptoFiat)
