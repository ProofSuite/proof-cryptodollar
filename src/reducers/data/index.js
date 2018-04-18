import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import web3Reducer from './web3'
import providersReducer from './providers'
import accountsReducer from './accounts'
import tokenReducer from './token'
import cryptoDollarBalancesReducer from './cryptoDollarBalances'
import etherBalancesReducer from './etherBalances'
import tokenBalancesReducer from './tokenBalances'
import rewardsReducer from './rewards'
import cryptoDollarReducer from './cryptoDollar'
import contractAddressesReducer from './contractAddresses'
import walletReducer from './wallet'

const dataReducer = combineReducers({
  web3: web3Reducer,
  provider: providersReducer,
  routing: routerReducer,
  accounts: accountsReducer,
  contractAddresses: contractAddressesReducer,
  tokens: tokenReducer,
  tokenBalances: tokenBalancesReducer,
  cryptoDollarBalances: cryptoDollarBalancesReducer,
  etherBalances: etherBalancesReducer,
  cryptoDollar: cryptoDollarReducer,
  rewards: rewardsReducer,
  wallets: walletReducer
})

export default dataReducer
