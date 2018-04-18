import { SET_WEB3, SET_WEB3_ERROR, SET_WEB3_DEFAULT } from '../../actions/web3Actions'

const initialState = {
  error: null,
  loading: true
}

const web3Reducer = (state = initialState, action) => {
  let { type } = action
  switch (type) {
    case SET_WEB3_DEFAULT:
      return {
        ...state,
        loading: false
      }
    case SET_WEB3:
      return {
        ...state,
        error: null,
        loading: false
      }
    case SET_WEB3_ERROR:
      return {
        ...state,
        loading: false
      }
    default:
      return state
  }
}

export default web3Reducer
