import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ProviderSettingsContainer from '../components/providerSettings/ProviderSettingsContainer'
// import WalletManagerContainer from '../components/walletManager/WalletManagerContainer'
import WalletManager from '../components/walletManager/WalletManager'
import WalletListContainer from '../components/walletList/WalletListContainer'

import { getAccounts } from '../selectors/accountSelectors'

import styles from './SettingsLayout.css'

class SettingsLayout extends Component {

  renderSettingsLayout () {
    return (
      <div className={styles.content}>
        <ProviderSettingsContainer />
        <WalletManager />
        <WalletListContainer />
      </div>
    )
  }

  renderLoading () {
    return <div>Loading</div>
  }

  render () {
    let { loading, error } = this.props.web3

    if (loading || error) {
      return this.renderLoading()
    } else {
      return this.renderSettingsLayout()
    }
  }
}

SettingsLayout.propTypes = {
  web3: PropTypes.object
}

const mapStateToProps = state => ({
  web3: state.data.web3,
  accounts: getAccounts(state.data.accounts)
})

export default connect(mapStateToProps)(SettingsLayout)
