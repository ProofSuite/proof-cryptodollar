import React, { Component } from 'react'

import styled from 'styled-components'

export default class WalletInformation extends Component {
  render () {
    return (
      <WalletInformationCard>
        <div>
          Your wallet address is: <em>0x7a9f3cd060ab180f36c17fe6bdf9974f577d77aa</em>
        </div>
      </WalletInformationCard>
    )
  }
}

const WalletInformationCard = styled.div`
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  width: 500px;
  margin: auto;
`
