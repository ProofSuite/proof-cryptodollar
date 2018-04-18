import { connect } from 'react-redux'
import ContractAddressesWidget from './ContractAddressesWidget'
import { queryContractAddresses } from './contractAddressesWidgetActions'
import { getContractAddressesWidgetLoading, getContractAddresses } from '../../selectors'

const mapStateToProps = state => {
  return {
    contractAddresses: getContractAddresses(state),
    loading: getContractAddressesWidgetLoading(state)
  }
}

const mapDispatchToProps = { queryContractAddresses }

export default connect(mapStateToProps, mapDispatchToProps)(ContractAddressesWidget)
