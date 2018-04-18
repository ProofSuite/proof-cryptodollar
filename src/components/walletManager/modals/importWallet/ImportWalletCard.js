import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import { Modal, Icon } from 'antd'

import styled from 'styled-components'

class ImportWalletCard extends Component {

  render () {
    return (
      <Modal
        title='Import Wallet Modal'
        visible = {this.props.visible}
        onOk = {this.props.onSubmit}
        onCancel = {this.props.hideModal}
      >
        <DropzoneContainer>
          <Dropzone onDrop={this.props.onDrop.bind(this)}>
            <DropzoneMessageContainer>
              <Icon type='inbox' style={{ fontSize: 120, color: '#1890ff' }} />
            </DropzoneMessageContainer>
          </Dropzone>
            <ul>{this.props.walletList}</ul>
            <p>Click or Drag files to upload your wallets</p>
        </DropzoneContainer>
      </Modal>
    )
  }
}

const DropzoneContainer = styled.div`
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: auto;
`

const DropzoneMessageContainer = styled.div`
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  justify-items: center;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 40px;
`

ImportWalletCard.propTypes = {
  visible: PropTypes.bool,
  hideModal: PropTypes.func,
  walletList: PropTypes.array,
  onDrop: PropTypes.func,
  onSubmit: PropTypes.func
}

export default ImportWalletCard
