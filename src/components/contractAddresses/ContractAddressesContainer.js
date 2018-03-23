import { connect } from 'react-redux'
import ContractAddresses from './ui/ContractAddresses'
import { fetchContractAddresses } from './contractAddressesActions'

const mapStateToProps = (state) => {
  return { contractAddresses: state.contractAddresses }
}

const mapDispatchToProps = { fetchContractAddresses }

export default connect(mapStateToProps, mapDispatchToProps)(ContractAddresses)
