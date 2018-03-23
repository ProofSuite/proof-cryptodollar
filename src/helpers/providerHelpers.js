import Web3 from 'web3'

export const getInfuraRinkebyProvider = ({ websockets }) => {
  if (!websockets) {
    return new Web3.providers.HttpProvider('http://rinkeby.infura.io')
  } else {
    return new Web3.providers.WebsocketProvider('ws://rinkeby.infura.io')
  }
}

export const getInfuraProvider = ({ websockets }) => {
  if (!websockets) {
    return new Web3.providers.HttpProvider('http://rinkeby.infura.io')
  } else {
    return new Web3.providers.WebsocketProvider('ws://rinkeby.infura.io')
  }
}

export const getRemoteProvider = ({ websockets, url }) => {
  if (!websockets) {
    return new Web3.providers.HttpProvider(url)
  } else {
    return new Web3.providers.WebsocketProvider(url)
  }
}

export const getLocalProvider = ({ websockets }) => {
  let provider
  if (!websockets) {
    provider = new Web3.providers.HttpProvider('http://localhost:8545')
  } else {
    provider = new Web3.providers.WebsocketProvider('ws://localhost:8545')
  }

  if (!provider) console.log('could not connect to local provider')
  return provider
}

export const getInjectedProvider = () => {
  let provider = Web3.givenProvider
  if (!provider) console.log('could not find an injected provider')
  return provider
}
