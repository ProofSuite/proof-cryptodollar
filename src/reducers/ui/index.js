import { combineReducers } from 'redux'
import txBuyReducer from './txForms/buy'
import txSellReducer from './txForms/sell'
import txSellUnpeggedReducer from './txForms/sellUnpegged'
import txTransferReducer from './txForms/transfer'
import withdrawRewardsReducer from './txForms/withdrawRewards'
import contractAddressesReducer from './contractAddresses'
import walletBalancesReducer from './walletBalances'
import accountBalancesReducer from './accountBalances'

const ui = combineReducers({
  contractAddressesWidget: contractAddressesReducer,
  buyCryptoDollar: txBuyReducer,
  sellCryptoDollar: txSellReducer,
  sellUnpeggedCryptoDollar: txSellUnpeggedReducer,
  transferCryptoDollar: txTransferReducer,
  withdrawRewards: withdrawRewardsReducer,
  walletBalances: walletBalancesReducer,
  accountBalances: accountBalancesReducer
})

export default ui
