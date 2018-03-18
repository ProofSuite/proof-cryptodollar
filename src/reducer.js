import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import web3Reducer from './services/web3/web3Reducer'
import accountsReducer from './components/accounts/accountsReducer'
import rewardsReducer from './components/rewards/rewardsReducer'
import contractAddressesReducer from './components/contractAddresses/contractAddressesReducer'
import cryptoDollarReducer from './components/cryptoDollar/cryptoDollarReducer'

const reducer = combineReducers({
  web3: web3Reducer,
  routing: routerReducer,
  accounts: accountsReducer,
  contractAddresses: contractAddressesReducer,
  cryptoDollar: cryptoDollarReducer,
  rewards: rewardsReducer
})

export default reducer
