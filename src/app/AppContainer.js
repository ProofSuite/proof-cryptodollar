import { connect } from 'react-redux'
import App from './App'

import { queryAccounts } from '../actions/accountActions'
import { getAccounts } from '../selectors/accountSelectors'
import { initializeWeb3 } from '../actions/web3Actions'

const mapStateToProps = state => ({
  web3: state.data.web3,
  accounts: getAccounts(state.data.accounts)
})

const mapDispatchToProps = {
  initializeWeb3,
  queryAccounts
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
