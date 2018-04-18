import {
  CONTRACT_ADDRESSES_WIDGET_LOADING,
  CONTRACT_ADDRESSES_WIDGET_ERROR,
  CONTRACT_ADDRESSES_WIDGET_UPDATED
} from '../../components/contractAddresses/contractAddressesWidgetActions.js'

const initialState = {
  loading: true,
  error: null
}

const contractAddressesWidget = (state = initialState, action) => {
  switch (action.type) {
    case CONTRACT_ADDRESSES_WIDGET_LOADING:
      return {
        ...state,
        loading: true,
        error: null
      }
    case CONTRACT_ADDRESSES_WIDGET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      }
    case CONTRACT_ADDRESSES_WIDGET_UPDATED:
      return {
        ...state,
        loading: false,
        error: null
      }
    default:
      return state
  }
}

export default contractAddressesWidget
