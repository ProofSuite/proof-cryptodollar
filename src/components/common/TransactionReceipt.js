import React, { Component } from 'react'
import { Accordion, Icon, List } from 'semantic-ui-react'
import PropTypes from 'prop-types'

class TransactionReceipt extends Component {
  state = { visible: false }

  toggleReceipt = e => {
    this.setState({ visible: !this.state.visible })
  }

  render () {
    const { receipt } = this.props
    const { visible } = this.state

    return (
        <Accordion color='green'>
          <Accordion.Title active={visible} index={0} onClick={this.toggleReceipt}>
            <Icon name='dropdown' />
            { visible ? `Hide Receipt` : `Show Receipt` }
          </Accordion.Title>
          <Accordion.Content active={visible}>
            <List>
              <List.Item key='1'>
                Block Hash : {receipt.blockHash}
              </List.Item>
              <List.Item key='2'>
                Block Number : {receipt.blockNumber}
              </List.Item>
              <List.Item key='3'>
                Gas Used : {receipt.gasUsed}
              </List.Item>
              <List.Item key='4'>
                Transaction Hash : {receipt.transactionHash}
              </List.Item>
            </List>
          </Accordion.Content>
        </Accordion>
    )
  }
}

TransactionReceipt.propTypes = {
  receipt: PropTypes.object
}

export default TransactionReceipt
