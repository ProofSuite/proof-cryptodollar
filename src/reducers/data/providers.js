import {
  SET_PROVIDER
} from '../../actions/providerActions'

// const localRPCProvider = {
//   type: 'local',   // local, infura, remote, injected, ledger
//   url: 'localhost:8545',
//   networkID: 8888,
//   websockets: false,
//   legacy: false
// }

const localWebsocketRPCProvider = {
  type: 'local',
  url: 'ws://127.0.0.1:8546',
  networkID: 8888,
  websockets: true,
  legacy: false
}

const rinkebyInfuraWebsocketProvider = {
  type: 'infura',
  url: 'wss://rinkeby.infura.io/_ws',
  networkID: 4,
  websockets: true,
  legacy: false
}

// const metamaskProvider = {
//   type: 'injected',
//   websockets: false,
//   legacy: false
// }

const providers = (state = localWebsocketRPCProvider, action) => {
  let { type, payload } = action
  switch (type) {
    case SET_PROVIDER:
      return {
        ...state,
        type: payload.options.type || state.type,
        url: payload.options.url || state.url,
        networkID: payload.options.networkID || state.networkID,
        websockets: payload.options.websockets || state.websockets,
        legacy: payload.options.legacy || state.legacy
      }
    default:
      return state
  }
}

export default providers
