import React from 'react'
import BalanceRow from './BalanceRow'
import { Table, Loader } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const WalletBalancesTable = (props) => {
  const balances = props.balances
  const balancesList = balances.map((balance, index) => (
    <BalanceRow key={index} {...balance} />
  ))

  return (
    <Table celled selectable striped>
      <Table.Header>
        <Table.Row active>
          <Table.HeaderCell>Address</Table.HeaderCell>
          <Table.HeaderCell>Ethereum Balance</Table.HeaderCell>
          <Table.HeaderCell>Cryptodollar Balance</Table.HeaderCell>
          <Table.HeaderCell>Reserved Ether Balance</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
      { balances ? balancesList : <Loader>Loading</Loader>}
      </Table.Body>
    </Table>
  )
}

WalletBalancesTable.propTypes = {
  balances: PropTypes.array
}

export default WalletBalancesTable
