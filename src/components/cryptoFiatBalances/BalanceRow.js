import React from 'react'
import { Table } from 'semantic-ui-react'

const BalanceRow = (props) => {
  const cells = Object.keys(props).map((variable) => <Table.Cell key={variable}>{props[variable]}</Table.Cell>)
  return (
    <Table.Row>
      {cells}
    </Table.Row>
  )
}

export default BalanceRow
