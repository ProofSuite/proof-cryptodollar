import store from '../../redux-store'
import CryptoFiatHub from '../../../build/contracts/CryptoFiatHub.json'
import { getTruffleContractAddress } from '../../helpers/contractHelpers'

export const createBuyCallbackListener = ({ receipt }) => async dispatch => {
  try {
    let web3 = store.getState().web3.web3Instance
    let events = receipt.events
    let buyTx = receipt.events.BuyCryptoDollar
    let queryId = buyTx.returnValues.queryId
    let sender = buyTx.returnValues.sender
    let value = buyTx.returnValues.value

    let address = getTruffleContractAddress(CryptoFiatHub)
    web3.eth.subscribe('logs', { address })
    .on('data', (log) => {
      console.log(log)
    })
    .on('changed', (log) => {
      console.log(log)
    })
  } catch (error) {
    console.log(error)
  }
}
