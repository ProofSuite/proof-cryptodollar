import React from 'react'
import PropTypes from 'prop-types'
import { Card, List, Header } from 'semantic-ui-react'

const ContractAddressesCard = (props) => {
  const contracts = props.contracts
  const contractList = Object.keys(contracts).map(name => (
     (
      <List.Item key={name}>
        <strong>{name}</strong> : {contracts[name]}
      </List.Item>
    )
  ))

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>
          <Header as='h3'>Contract Addresses</Header>
        </Card.Header>
        <Card.Description>
          <List>
            {contractList}
          </List>
        </Card.Description>
        </Card.Content>
      </Card>
  )
}

ContractAddressesCard.propTypes = {
  contracts: PropTypes.object
}

export default ContractAddressesCard
