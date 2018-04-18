import {
  QUERYING_REWARDS_STATE,
  QUERY_REWARDS_STATE_SUCCESS,
  QUERY_REWARDS_STATE_ERROR
} from '../../actions/rewards/queryContractState'

let initialState = {
  loading: true,
  error: null,
  data: {
    currentPoolIndex: '',
    currentEpoch: '',
    currentPoolBalance: ''
  }
}

const rewards = (state = initialState, action) => {
  let { type, payload } = action
  switch (type) {
    case QUERYING_REWARDS_STATE:
      return {
        ...state,
        loading: true,
        error: null
      }
    case QUERY_REWARDS_STATE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: payload.data,
        error: null
      }
    case QUERY_REWARDS_STATE_ERROR:
      return {
        ...state,
        loading: false,
        data: initialState.data,
        error: payload.error
      }
    default:
      return state
  }
}

export default rewards
