import React from 'react'
import PropTypes from 'prop-types'
import { Table, Header } from 'semantic-ui-react'

const RewardsContractState = ({ data }) => {
  const dataList = Object.keys(data).map(variable => (
      (
        <Table.Row key={variable}>
          <Table.Cell>{variable}</Table.Cell>
          <Table.Cell>{data[variable]}</Table.Cell>
        </Table.Row>
      )
  ))

  return (
    <div>
      <Header>Rewards Contract State</Header>
      <Table basic='very'>
        <Table.Body>
          {dataList}
        </Table.Body>
      </Table>
    </div>
  )
}

RewardsContractState.propTypes = {
  data: PropTypes.object
}

export default RewardsContractState
