import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import WalletList from './WalletList'
import PropTypes from 'prop-types'
import { removeWallets, setDefaultWallet } from '../../actions/walletActions'
import { getWalletList } from '../../selectors/walletSelectors'

class WalletListContainer extends PureComponent {
  state = {
    selectedWallets: [],
    loading: false
  }

  onSelectWallet = selectedWallets => {
    this.setState({ selectedWallets })
  }

  onSelectDefaultWallet = () => {
    let defaultWalletIndex = this.state.selectedWallets[0]
    let defaultWallet = this.props.walletList[defaultWalletIndex].wallet
    this.props.setDefaultWallet({ defaultWallet })
    this.setState({ selectedWallets: [] })
  }

  deleteWallet = () => {
    let wallets = this.state.selectedWallets.map(index => this.props.walletList[index].wallet)
    this.props.removeWallets(wallets)
    this.setState({ selectedWallets: [] })
  }

  render () {
    const mergedProps = {
      ...this.props,
      ...this.state,
      onSelectWallet: this.onSelectWallet,
      onSelectDefaultWallet: this.onSelectDefaultWallet,
      deleteWallet: this.deleteWallet
    }
    return <WalletList {...mergedProps} />
  }
}

const mapStateToProps = state => {
  return {
    walletList: getWalletList(state.data.wallets)
  }
}

const mapDispatchToProps = {
  removeWallets,
  setDefaultWallet
}

WalletListContainer.propTypes = {
  walletList: PropTypes.array,
  removeWallets: PropTypes.func,
  setDefaultWallet: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletListContainer)
