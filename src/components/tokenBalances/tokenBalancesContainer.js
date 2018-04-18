import { connect } from 'react-redux'
import TokenBalances from './TokenBalances'
import { queryAllBalances } from './cryptoFiatBalancesActions'

// TODO
const mapStateToProps = (state) => {
  return { balances: state.balances }
}

const mapDispatchToProps = { queryAllBalances }
export default connect(mapStateToProps, mapDispatchToProps)(TokenBalances)
