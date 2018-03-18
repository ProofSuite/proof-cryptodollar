import Web3 from 'web3'
import { getInfuraProvider } from '../../helpers/providerHelpers'

export const web3Actions = {
  initializeWeb3Success: (web3Instance) => ({ type: 'INITIALIZE_WEB3_SUCCESS', payload: web3Instance }),
  initializeWeb3Error: (error) => ({ type: 'INITIALIZE_WEB3_ERROR', payload: error })
}

export const initializeWeb3 = ({ ws }) => {
  return async dispatch => {
    const provider = new Web3.providers.WebsocketProvider('ws://localhost:8546')
    if (!provider) return dispatch(web3Actions.initializeWeb3Error('could not connect to provider'))

    const web3 = new Web3(provider)
    if (!web3) return dispatch(web3Actions.initializeWeb3Error('could not find web3'))

    window.web3 = web3

    dispatch(web3Actions.initializeWeb3Success(web3))
  }
}

export const initializeRemoteWeb3 = ({ ws }) => {
  return async dispatch => {
    const provider = getInfuraProvider(ws)
    if (!provider) return dispatch(web3Actions.initializeWeb3Error('could not connect to provider'))

    const web3 = new Web3(provider)
    if (!web3) return dispatch(web3Actions.initializeWeb3Error('could not find web3'))
    dispatch(web3Actions.initializeWeb3Success(web3))
  }
}
