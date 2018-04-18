import React, { Component } from 'react'
import BuyCryptoDollarTxForm from './txForms/BuyCryptoDollarTxForm'
import SellCryptoDollarTxForm from './txForms/SellCryptoDollarTxForm'
import SellUnpeggedCryptoDollarTxForm from './txForms/SellUnpeggedCryptoDollarTxForm'
import TransferCryptoDollarTxForm from './txForms/TransferCryptoDollarTxForm'
import CryptoDollarContractState from './CryptoDollarContractState'
import PropTypes from 'prop-types'
import { Tab } from 'semantic-ui-react'

class CryptoDollar extends Component {

  componentDidMount (props) {
    this.props.queryCryptoDollarContractState()
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

  renderBuyCryptoDollarTxForm = () => (
      <Tab.Pane attached={false}>
        <BuyCryptoDollarTxForm/>
      </Tab.Pane>
  )

  renderSellCryptoDollarTxForm = () => (
    <Tab.Pane attached={false}>
      <SellCryptoDollarTxForm/>
    </Tab.Pane>
  )

  renderSellUnpeggedCryptoDollarTxForm = () => (
    <Tab.Pane attached={false}>
      <SellUnpeggedCryptoDollarTxForm/>
    </Tab.Pane>
  )

  renderTransferCryptoDollarTxForm = () => (
    <Tab.Pane attached={false}>
      <TransferCryptoDollarTxForm/>
    </Tab.Pane>
  )

  render () {
    const panes = [
      { menuItem: 'Contract State', render: this.renderContractState },
      { menuItem: 'Buy', render: this.renderBuyCryptoDollarTxForm },
      { menuItem: 'Sell', render: this.renderSellCryptoDollarTxForm },
      { menuItem: 'Sell (unpegged)', render: this.renderSellUnpeggedCryptoDollarTxForm },
      { menuItem: 'Transfer', render: this.renderTransferCryptoDollarTxForm }
    ]

    return (
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    )
  }
}

CryptoDollar.propTypes = {
  contractState: PropTypes.object,
  queryCryptoDollarContractState: PropTypes.func
}

export default CryptoDollar
