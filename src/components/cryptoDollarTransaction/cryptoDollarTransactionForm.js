import React, { Component } from 'react'
import BuyCryptoDollarInput from './BuyCryptoDollarInput'
import SellCryptoDollarInput from './SellCryptoDollarInput'
import SellUnpeggedCryptoDollarInput from './SellUnpeggedCryptoDollarInput'

import styles from './styles.css'

export default class CryptoDollarTransactionForm extends Component {
  render () {
    return (
      <div className={styles.cryptoDollarTransactionForm}>
        <BuyCryptoDollarInput />
        <SellCryptoDollarInput />
        <SellUnpeggedCryptoDollarInput />
      </div>
    )
  }
}
