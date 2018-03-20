import store from '../../redux-store'
import CryptoFiatHub from '../../../build/contracts/CryptoFiatHub.json'
import { getTruffleContractAddress } from '../../helpers/contractHelpers'

export const createBuyCallbackListener = (receipt) => {
  console.log(receipt)
}
