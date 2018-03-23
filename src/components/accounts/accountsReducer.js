export default function (state = { loading: false, accounts: [] }, action) {
  switch (action.type) {
    case 'FETCHING_ACCOUNTS':
      return {
        ...state,
        loading: true,
        accounts: []
      }
    case 'FETCH_ACCOUNTS_ERROR':
      return {
        ...state,
        loading: false,
        accounts: []
      }
    case 'FETCH_ACCOUNTS_SUCCESS':
      return {
        ...state,
        loading: false,
        accounts: action.payload
      }
    default:
      return state
  }
}

