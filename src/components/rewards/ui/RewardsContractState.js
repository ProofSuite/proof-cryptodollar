import React from 'react'
import PropTypes from 'prop-types'
import { Header, List } from 'semantic-ui-react'

const RewardsContractState = (props) => {
  const data = props.data
  const dataList = Object.keys(data).map(variable => (
      (
        <List.Item key={variable}>
          {variable} : {data[variable]}
        </List.Item>
      )
  ))

  return (
    <div>
      <Header>Rewards Contract State</Header>
      <List>
        {dataList}
      </List>
    </div>
  )
}

RewardsContractState.propTypes = {
  data: PropTypes.object
}

export default RewardsContractState
