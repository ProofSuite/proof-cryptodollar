import React from 'react'
import AccountRow from './AccountRow'
import { Table } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const AccountTable = (props) => {
  const accounts = props.accounts
  const listAccounts = accounts.map((account, index) => (
    <AccountRow
      key={index}
      address={account.address}
      etherBalance={account.etherBalance}
      cryptoDollarBalance={account.cryptoDollarBalance}
    />
  ))

  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Address</Table.HeaderCell>
          <Table.HeaderCell>Ethereum Balance</Table.HeaderCell>
          <Table.HeaderCell>CryptoDollar Balance</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {listAccounts}
      </Table.Body>
    </Table>
  )
}

AccountTable.propTypes = {
  accounts: PropTypes.object
}

export default AccountTable
