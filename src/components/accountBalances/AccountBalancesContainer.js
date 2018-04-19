import { connect } from 'react-redux'
import AccountBalances from './AccountBalances'
import { queryAccountBalances } from './actions'
import { getAccountBalances } from '../../selectors/'

const mapStateToProps = (state) => {
  return {
    balances: getAccountBalances(state)
  }
}

const mapDispatchToProps = { queryAccountBalances }

export default connect(mapStateToProps, mapDispatchToProps)(AccountBalances)
