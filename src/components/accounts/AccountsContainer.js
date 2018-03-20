import { connect } from 'react-redux'
import Accounts from './ui/Accounts'
import { fetchAccounts } from './accountsActions'

// const formatAccountData = (accounts) => {
//   accounts.map((account) => {
//     return {
//       address: account.address,
//       etherBalance: formatEther(account.etherBalance),
//       crypot
//     }
//   }
// }

const mapStateToProps = (state) => {
  console.log(state.accounts.accounts)
  return { accounts: state.accounts.accounts }
}

const mapDispatchToProps = { fetchAccounts }

export default connect(mapStateToProps, mapDispatchToProps)(Accounts)
