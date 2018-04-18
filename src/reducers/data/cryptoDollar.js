let initialState = {
  loading: true,
  error: null,
  data: {}
}

import {
  QUERYING_CRYPTODOLLAR_STATE,
  QUERY_CRYPTODOLLAR_STATE_SUCCESS,
  QUERY_CRYPTODOLLAR_STATE_ERROR
} from '../../actions/cryptoDollarActions'

const cryptoDollar = (state = initialState, action) => {
  let { type, payload } = action
  switch (type) {
    case QUERYING_CRYPTODOLLAR_STATE:
      return {
        ...state,
        loading: true,
        data: {},
        error: null
      }
    case QUERY_CRYPTODOLLAR_STATE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: payload.data,
        error: null
      }
    case QUERY_CRYPTODOLLAR_STATE_ERROR:
      return {
        ...state,
        loading: false,
        data: {},
        error: payload.error
      }
    default:
      return state
  }
}

export default cryptoDollar
