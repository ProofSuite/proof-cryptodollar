import { getLocalWeb3, getInfuraWeb3 } from './web3'

export const web3Actions = {
  initializeWeb3Success: (web3Instance) => ({ type: 'INITIALIZE_WEB3_SUCCESS', payload: web3Instance }),
  initializeWeb3Error: (error) => ({ type: 'INITIALIZE_WEB3_ERROR', payload: error }),
  getWeb3Success: (web3Instance) => ({ type: 'GET_WEB3_SUCCESS', payload: web3Instance }),
  getWeb3Error: (error) => ({ type: 'GET_WEB3_ERROR', payload: error })
}

export const initializeWeb3 = ({ websockets }) => {
  return async dispatch => {
    const web3 = getLocalWeb3({ websockets })
    if (!web3) return dispatch(web3Actions.initializeWeb3Error('could not find web3 object'))

    dispatch(web3Actions.initializeWeb3Success(web3))
  }
}

export const initializeRemoteWeb3 = ({ websockets }) => {
  return async dispatch => {
    const web3 = getInfuraWeb3({ websockets })
    if (!web3) return dispatch(web3Actions.initializeWeb3Error('could not find web3 object'))

    dispatch(web3Actions.initializeWeb3Success(web3))
  }
}
