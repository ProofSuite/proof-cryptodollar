const initialState = {
  web3Instance: null,
  error: null
}

const web3Reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INITIALIZE_WEB3_SUCCESS':
      return {
        ...state,
        web3Instance: action.payload,
        error: ''
      }
    case 'INITIALIZE_WEB3_ERROR':
      return {
        ...state,
        web3Instance: null,
        error: action.payload
      }
    default:
      return state
  }
}

export default web3Reducer
