import { connect } from 'react-redux'
import Accounts from './ui/Accounts'
import { fetchAccounts } from './accountsActions'

const mapStateToProps = (state) => {
  return { accounts: state.accounts.accounts }
}

const mapDispatchToProps = { fetchAccounts }

export default connect(mapStateToProps, mapDispatchToProps)(Accounts)
