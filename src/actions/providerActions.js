export const SET_PROVIDER = 'SET_PROVIDER'
export const SET_PROVIDER_ERROR = 'SET_PROVIDER_ERROR'

export const setProvider = (options) => ({ type: SET_PROVIDER, payload: { options } })

export const setProviderError = (error) => dispatch =>
  dispatch({ type: SET_PROVIDER_ERROR, payload: { error } })

export const setCustomProvider = (providerOptions) => dispatch => {
  try {
    let options
    switch (providerOptions.provider) {
      case 'metamask':
        options = {
          type: 'injected',
          url: 'http://127.0.0.1:8545', // not sure if necessary
          networkID: 8888, // not sure if necessary
          websockets: false,
          legacy: true
        }
        return dispatch(setProvider(options))
      case 'local':
        options = {
          type: 'local',
          url: 'ws://127.0.0.1:8546',
          networkID: 8888,
          websockets: true,
          legacy: false
        }
        return dispatch(setProvider(options))
      case 'infura':
        options = {
          type: 'remote',
          url: 'wss://mainnet.infura.io/ws',
          networkID: 8888,
          websockets: true,
          legacy: false
        }
        return dispatch(setProvider(options))
      case 'infura (rinkeby)':
        options = {
          type: 'infura',
          url: 'wss://rinkeby.infura.io/_ws',
          networkID: 4,
          websockets: true,
          legacy: false
        }
        return dispatch(setProvider(options))
      case 'custom':
        console.log('setting custom provider')
        return dispatch(setProvider(providerOptions))
      default:
        return
    }
  } catch (error) {
    console.log(error)
  }
}
