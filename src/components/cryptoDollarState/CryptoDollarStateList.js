import React from 'react'
import PropTypes from 'prop-types'
import { Card, List } from 'semantic-ui-react'

const CryptoDollarStateCard = (props) => {
  const variablesList = props.contractState.map((variable, index) => (
    <List.Item key={index}>
      {variable.name} : {variable.value}
    </List.Item>
  ))

  return (
    <Card>
      <Card.Content>
      <Card.Header>
        CryptoDollar State
      </Card.Header>
      <Card.Description>
        <List>
          {variablesList}
        </List>
      </Card.Description>
      </Card.Content>
    </Card>
  )
}

CryptoDollarStateCard.propTypes = {
  contractState: PropTypes.object
}

export default CryptoDollarStateCard
