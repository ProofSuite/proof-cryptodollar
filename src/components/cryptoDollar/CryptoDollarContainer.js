import { connect } from 'react-redux'
import CryptoDollar from './CryptoDollar'

import { queryCryptoDollarContractState } from '../../actions/cryptoDollarActions'
import { getCryptoDollarContractState } from '../../selectors'

const mapStateToProps = state => {
  return {
    contractState: getCryptoDollarContractState(state)
  }
}

const mapDispatchToProps = {
  queryCryptoDollarContractState
}

export default connect(mapStateToProps, mapDispatchToProps)(CryptoDollar)
