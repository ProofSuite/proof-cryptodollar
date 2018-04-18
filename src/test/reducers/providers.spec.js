import providerReducer from '../../reducers/data/providers'
import chai from 'chai'
import { SET_PROVIDER } from '../../actions/providerActions'

const expect = chai.expect

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

describe('Providers reducer', () => {
  it('should return websocket RPC provider state', () => {
    let options = {
      type: 'infura',
      url: 'wss://rinkeby.infura.io/_ws',
      networkID: 4,
      websockets: true,
      legacy: false
    }
    let expectedState = {
      type: 'infura',
      url: 'wss://rinkeby.infura.io/_ws',
      networkID: 4,
      websockets: true,
      legacy: false
    }
    let action = { type: SET_PROVIDER, payload: { options } }
    expect(providerReducer(undefined, action)).to.deep.equal(expectedState)
  })
})
