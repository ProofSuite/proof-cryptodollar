import { connect } from 'react-redux'
import CryptoFiatBalances from './CryptoFiatBalances'
import { queryCryptoFiatBalances } from './cryptoFiatBalancesActions'
import { getCryptoFiatBalances } from '../../selectors/'

const mapStateToProps = (state) => {
  return {
    balances: getCryptoFiatBalances(state)
  }
}

const mapDispatchToProps = { queryCryptoFiatBalances }

export default connect(mapStateToProps, mapDispatchToProps)(CryptoFiatBalances)
