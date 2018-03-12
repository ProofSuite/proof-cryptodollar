import React, { Component } from 'react'
import BuyCryptoDollarInput from './BuyCryptoDollarInput'
import SellCryptoDollarInput from './SellCryptoDollarInput'
import SellUnpeggedCryptoDollarInput from './SellUnpeggedCryptoDollarInput'

export default class CryptoDollarTransactionForm extends Component {
  render() {
    return (
      <div>
        <BuyCryptoDollarInput />
        <SellCryptoDollarInput />
        <SellUnpeggedCryptoDollarInput />
      </div>
    )
  }
}
