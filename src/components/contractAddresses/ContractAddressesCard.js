import React from 'react'
import PropTypes from 'prop-types'
import { Card, Header, Table } from 'semantic-ui-react'

const ContractAddressesCard = ({ contracts }) => {
  const contractList = Object.keys(contracts).map(name => (
      <Table.Row key={name}>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{contracts[name]}</Table.Cell>
      </Table.Row>
  ))

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>
          <Header as='h3'>Contract Addresses</Header>
        </Card.Header>
        <Card.Description>
          <Table basic='very'>
            <Table.Body>
              {contractList}
            </Table.Body>
          </Table>
        </Card.Description>
      </Card.Content>
    </Card>
  )
}

ContractAddressesCard.propTypes = {
  contracts: PropTypes.object
}

export default ContractAddressesCard
