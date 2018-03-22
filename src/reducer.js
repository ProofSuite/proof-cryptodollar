import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import web3Reducer from './utils/web3/web3Reducer'

const reducer = combineReducers({
  web3: web3Reducer,
  routing: routerReducer
})

export default reducer
