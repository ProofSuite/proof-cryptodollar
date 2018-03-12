
import React, { Component } from 'react'
import CryptoDollarStateList from './CryptoDollarStateList'

export default class CryptoDollarState extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <CryptoDollarStateList contractState={this.props.contractState} />
      </div>
    )
  }
}
