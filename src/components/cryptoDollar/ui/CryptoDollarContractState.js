import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Header, List } from 'semantic-ui-react'

class CryptoDollarContractState extends Component {
  renderContractState (data) {
    const dataList = Object.keys(data).map(variable => (
      <List.Item key={variable}>
        {variable} : {data[variable]}
      </List.Item>
    ))

    return (
      <div>
        <Header>CryptoDollar Contract State</Header>
        <List>
          {dataList}
        </List>
      </div>
    )
  }

  renderLoader () {
    return <div>Loading</div>
  }

  render () {
    const { data, loading } = this.props
    if (loading || !data) return this.renderLoader()

    return this.renderContractState(data)
  }
}

CryptoDollarContractState.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool
}

export default CryptoDollarContractState
