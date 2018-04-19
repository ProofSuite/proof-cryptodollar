import { connect } from 'react-redux'
import WalletBalances from './WalletBalances'
import { getWalletBalances } from '../../selectors/'

const mapStateToProps = (state) => {
  return {
    balances: getWalletBalances(state)
  }
}

export default connect(mapStateToProps)(WalletBalances)
