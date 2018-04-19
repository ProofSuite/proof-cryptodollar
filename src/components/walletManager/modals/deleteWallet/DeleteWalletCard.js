import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Steps } from 'antd'

class DeleteWalletCard extends Component {

  render () {
    return (
      <Modal
        title='Delete Wallet Modal'
        visible = {this.props.visible}
        onOk = {this.props.hideModal}
        onCancel = {this.props.hideModal}
      >
      <Steps current={this.props.currentStep}>
        <Steps.Step title='Finished' description='This is a description.' />
        <Steps.Step title='In Progress' description='This is a description.' />
        <Steps.Step title='Waiting' description='This is a description.' />
      </Steps>
      </Modal>
    )
  }
}

DeleteWalletCard.propTypes = {
  visible: PropTypes.bool,
  hideModal: PropTypes.func,
  currentStep: PropTypes.number
}

export default DeleteWalletCard
