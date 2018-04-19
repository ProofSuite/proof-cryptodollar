import React, { Component } from 'react'
import DeleteWalletCard from './DeleteWalletCard'

class DeleteWalletModal extends Component {

  state = {
    currentStep: 1
  }

  next = () => {
    const currentStep = this.state.currentStep + 1
    this.setState({ currentStep })
  }

  prev = () => {
    const currentStep = this.state.currentStep - 1
    this.setState({ currentStep })
  }

  render () {
    const mergedProps = { ...this.props, ...this.state, next: this.next }
    return (<DeleteWalletCard {...mergedProps} />)
  }
}

export default DeleteWalletModal
