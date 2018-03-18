import React, { Component } from 'react'
import BuyCryptoDollarInput from './BuyCryptoDollarInput'
import SellCryptoDollarInput from './SellCryptoDollarInput'
import SellUnpeggedCryptoDollarInput from './SellUnpeggedCryptoDollarInput'
import TransferCryptoDollarInput from './TransferCryptoDollarInput'
import CryptoDollarContractState from './CryptoDollarContractState'
import PropTypes from 'prop-types'
import { Tab } from 'semantic-ui-react'

class CryptoDollar extends Component {

  componentDidMount (props) {
    this.props.fetchCryptoDollarContractState()
  }

  renderContractState = () => {
    const { error, data } = this.props.contractState
    return (
      <Tab.Pane attached={false}>
        <CryptoDollarContractState
          error={error}
          data={data}
        />
      </Tab.Pane>
    )
  }

  renderBuyCryptoDollarInput = () => (
      <Tab.Pane attached={false}>
        <BuyCryptoDollarInput
          buyCryptoDollar={this.props.buyCryptoDollar}
          status={this.props.buyStatus}
        />
      </Tab.Pane>
  )

  renderSellCryptoDollarInput = () => (
    <Tab.Pane attached={false}>
      <SellCryptoDollarInput
        sellCryptoDollar={this.props.sellCryptoDollar}
        status={this.props.sellStatus}
      />
    </Tab.Pane>
  )

  renderSellUnpeggedCryptoDollarInput = () => (
    <Tab.Pane attached={false}>
      <SellUnpeggedCryptoDollarInput
        sellUnpeggedCryptoDollar={this.props.sellUnpeggedCryptoDollar}
        status={this.props.sellUnpeggedStatus}
      />
    </Tab.Pane>
  )

  renderTransferCryptoDollarInput = () => (
    <Tab.Pane attached={false}>
      <TransferCryptoDollarInput
        transferCryptoDollar={this.props.transferCryptoDollar}
        status={this.props.transferStatus}
      />
    </Tab.Pane>
  )

  render () {
    const panes = [
      { menuItem: 'Contract State', render: this.renderContractState },
      { menuItem: 'Buy', render: this.renderBuyCryptoDollarInput },
      { menuItem: 'Sell', render: this.renderSellCryptoDollarInput },
      { menuItem: 'Sell (unpegged)', render: this.renderSellUnpeggedCryptoDollarInput },
      { menuItem: 'Transfer', render: this.renderTransferCryptoDollarInput }
    ]

    return (
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    )
  }
}

CryptoDollar.propTypes = {
  contractState: PropTypes.object,
  buyStatus: PropTypes.object,
  sellStatus: PropTypes.object,
  sellUnpeggedStatus: PropTypes.object,
  transferStatus: PropTypes.object,
  buyCryptoDollar: PropTypes.func,
  sellCryptoDollar: PropTypes.func,
  sellUnpeggedCryptoDollar: PropTypes.func,
  transferCryptoDollar: PropTypes.func,
  fetchCryptoDollarContractState: PropTypes.func
}

export default CryptoDollar
