import React from 'react'
import PropTypes from 'prop-types'
import { Card, List } from 'semantic-ui-react'

const DeployedContractsCard = (props) => {
  const contracts = props.contracts
  const contractList = contracts.map((contract, index) => (
    <List.Item key={index}>
      {contract.name}: {contract.address}
    </List.Item>
  ))

  return (
    <Card>
      <Card.Content>
        <Card.Header>
          Deployed Contracts
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

DeployedContractsCard.propTypes = {
  contracts: PropTypes.object
}

export default DeployedContractsCard
