import { connect } from 'react-redux'
import ProviderSettings from './ProviderSettings'

import { setProvider, setCustomProvider } from '../../actions/providerActions'

const mapDispatchToProps = {
  setCustomProvider,
  setProvider
}

export default connect(null, mapDispatchToProps)(ProviderSettings)
