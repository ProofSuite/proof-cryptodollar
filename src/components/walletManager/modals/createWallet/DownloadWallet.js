import React, { Component } from 'react'
import { Icon } from 'antd'

import styled from 'styled-components'

export default class DownloadWallet extends Component {
  render () {
    return (
      <DownloadWalletContainer>
        <div>
          <Icon type='check-circle' style={{ fontSize: 60, color: 'green' }} />
        </div>
        <p style={{ fontSize: 26 }}>Wallet successfully created!</p>
      </DownloadWalletContainer>
    )
  }
}

const DownloadWalletContainer = styled.div`
  display: flex;
  height: 200px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
