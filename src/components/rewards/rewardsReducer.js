const initialState = {
  contractState: {
    loading: true,
    error: null,
    data: {
      currentPoolIndex: '',
      currentEpoch: '',
      currentPoolBalance: ''
    }
  },
  withdraw: {
    loading: false,
    error: null,
    receipt: {}
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'CALL_REWARDS_CONTRACT':
      return {
        ...state,
        contractState: {
          ...state.contractState,
          loading: false,
          error: null,
          data: {
            currentPoolIndex: '',
            currentEpoch: '',
            currentPoolBalance: ''
          }
        }
      }
    case 'CALL_REWARDS_CONTRACT_ERROR':
      return {
        ...state,
        contractState: {
          ...state.contractState,
          loading: false,
          error: action.payload,
          data: {
            currentPoolIndex: '',
            currentEpoch: '',
            currentPoolBalance: ''
          }
        }
      }
    case 'CALL_REWARDS_CONTRACT_SUCCESS':
      return {
        ...state,
        contractState: {
          ...state.contractState,
          loading: false,
          error: null,
          data: action.payload
        }
      }
    case 'WITHDRAWING_REWARDS':
      return {
        ...state,
        withdraw: {
          ...state.withdraw,
          loading: false,
          error: null,
          receipt: {}
        }
      }
    case 'WITHDRAW_REWARDS_ERROR':
      return {
        ...state,
        withdraw: {
          ...state.withdraw,
          loading: false,
          error: null,
          receipt: {}
        }
      }
    default:
      return state
  }
}
