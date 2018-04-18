import {
  CONTRACT_ADDRESSES_LOADING,
  CONTRACT_ADDRESSES_ERROR,
  UPDATE_CONTRACT_ADDRESSES
} from '../../actions/contractAddressesActions'

let initialState = {
  loading: true,
  contracts: {},
  error: null
}

const contractAddresses = (state = initialState, action) => {
  let { type, payload } = action
  switch (type) {
    case CONTRACT_ADDRESSES_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
        contracts: {}
      }
    case UPDATE_CONTRACT_ADDRESSES:
      return {
        ...state,
        loading: false,
        error: null,
        contracts: payload.contracts
      }
    case CONTRACT_ADDRESSES_ERROR:
      return {
        ...state,
        loading: false,
        error: payload.error,
        contracts: {}
      }
    default:
      return state
  }
}

export default contractAddresses
