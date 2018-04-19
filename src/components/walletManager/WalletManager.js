import React, { Component } from 'react'
import WalletManagerCard from './WalletManagerCard'
import CreateWalletModal from './modals/createWallet/CreateWalletModal'
import ImportWalletModal from './modals/importWallet/ImportWalletModal'
import DeleteWalletModal from './modals/deleteWallet/DeleteWalletModal'
import styles from '../../layouts/SettingsLayout.css'

class WalletManager extends Component {

  state = {
    createModalVisible: false,
    importModalVisible: false,
    deleteModalVisible: false
  }

  showCreateModal = () => {
    this.setState({ createModalVisible: true })
  }

  hideCreateModal = () => {
    this.setState({ createModalVisible: false })
  }

  showImportModal = () => {
    this.setState({ importModalVisible: true })
  }

  hideImportModal = () => {
    this.setState({ importModalVisible: false })
  }

  showDeleteModal = () => {
    this.setState({ deleteModalVisible: true })
  }

  hideDeleteModal = () => {
    this.setState({ deleteModalVisible: false })
  }

  render () {
    const showModals = {
      showCreateModal: this.showCreateModal,
      showImportModal: this.showImportModal,
      showDeleteModal: this.showDeleteModal
    }

    return (
      <div className={styles.walletManager}>
        <WalletManagerCard {...showModals} />
        <CreateWalletModal
          visible = {this.state.createModalVisible}
          hideModal = {this.hideCreateModal}
          />
        <ImportWalletModal
          visible = {this.state.importModalVisible}
          hideModal = {this.hideImportModal}
        />
        <DeleteWalletModal
          visible = {this.state.deleteModalVisible}
          hideModal = {this.hideDeleteModal}
        />
      </div>
    )
  }

}

export default WalletManager
