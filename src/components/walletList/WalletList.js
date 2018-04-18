import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Table } from 'antd'
import styles from '../../layouts/SettingsLayout.css'

import styled from 'styled-components'

class WalletTable extends Component {

  render () {
    const { selectedWallets, deleteWallet, onSelectWallet, onSelectDefaultWallet, walletList } = this.props
    const rowSelection = { selectedRowKeys: selectedWallets, onChange: onSelectWallet }

    const columns = [
      {
        title: 'Wallet',
        dataIndex: 'wallet',
        key: 'wallet'
      }
    ]

    return (
      <div className={styles.walletList}>
        <WalletTableButtons>
          <Button.Group>
            <Button type='primary' onClick={deleteWallet}>
              Delete Selected Wallets
            </Button>
            <Button type='primary' onClick={onSelectDefaultWallet}>
              Select Default Wallet
            </Button>
          </Button.Group>
        </WalletTableButtons>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={walletList}
        />
      </div>
    )
  }
}

const WalletTableButtons = styled.div`
  padding-bottom: 20px;
`

WalletTable.propTypes = {
  walletList: PropTypes.array,
  selectedWallets: PropTypes.array,
  deleteWallet: PropTypes.func,
  onSelectDefaultWallet: PropTypes.func,
  onSelectWallet: PropTypes.func
}

export default WalletTable
