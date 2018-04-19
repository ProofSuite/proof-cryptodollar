import Web3 from 'web3'
import Web3ProviderEngine from 'web3-provider-engine'
import { RPCSubprovider } from 'web3-provider-engine/subproviders/rpc'
import {
  ledgerEthereumBrowserClientFactoryAsync as ledgerEthereumClientFactoryAsync,
  LedgerSubprovider,
  InjectedWeb3Subprovider
} from '@0xproject/subproviders'

// /**
//  * @description Creates an web3 1.0 rinkeby provider from an infura endpoint
//  * @param { websockets } - Boolean flag to indicate HTTP or WS protocol
//  * @returns [Object] - Web3 provider (1.0)
//  */
// export const getInfuraTestnetProvider = ({ websockets }) => {
//   if (!websockets) {
//     return new Web3.providers.HttpProvider('http://rinkeby.infura.io')
//   } else {
//     return new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/_ws')
//   }
// }

// /**
//  * @description Creates a web3 1.0 mainnet provider from an infura endpoint
//  * @param { websockets } - Boolean flag to indicate HTTP or WS protocol
//  * @returns [Object] - Web3 Provider (1.0)
//  */
// export const getInfuraProvider = ({ websockets, networkID, url }) => {
//   console.log(url)
//   if (!websockets) {
//     return new Web3.providers.HttpProvider(url)
//   } else {
//     return new Web3.providers.WebsocketProvider(url)
//   }
// }

// /**
//  * @description Creates a web3 1.0 provider from a url
//  * @param { websockets, url } [Object] - Boolean Flag to indicate HTTP or WS protocol, provider URL
//  * @returns [Object] - Web3 Provider (1.0)
//  */
// export const getRemoteProvider = ({ websockets, url }) => {
//   if (!websockets) {
//     return new Web3.providers.HttpProvider(url)
//   } else {
//     return new Web3.providers.WebsocketProvider(url)
//   }
// }

// /**
//  * @description Creates a web3 1.0 standard local provider
//  * @param { websockets } [Object] - Boolean Flag to indicate HTTP or WS protocol
//  * @returns [Object] - Web3 Provider (1.0)
//  */
// export const getLocalProvider = ({ websockets }) => {
//   let provider
//   if (!websockets) {
//     provider = new Web3.providers.HttpProvider('http://localhost:8545')
//   } else {
//     provider = new Web3.providers.WebsocketProvider('ws://localhost:8546')
//   }

//   if (!provider) console.log('could not connect to local provider')
//   return provider
// }

/**
 * @description Creates a web3 1.0 from an injected web3 instance
 * @returns [Object] - Web3 Provider (1.0)
 */
export const getInjectedProvider = () => {
  const provider = Web3.givenProvider
  if (!provider) console.log('no given provider found')

  return provider
}

// Legacy Providers (useful for interacting with 0x.js)
// Currently not using these functions.
export const getLegacyProvider = (local, url) => {
  if (!local && !url) console.log('could not instantiate provider')

  let provider
  if (local) {
    provider = getLocalLegacyProvider()
  } else {
    provider = getRemoteLegacyProvider(url)
  }
  return provider
}

export const getLocalLegacyProvider = () => {
  const providerEngine = new Web3ProviderEngine()
  providerEngine.addEngine(new RPCSubprovider({ rpcUrl: 'http://localhost:8545' }))
  providerEngine.start()

  return providerEngine
}

export const getLegacyInjectedProvider = () => {
  const providerEngine = new Web3ProviderEngine()

  providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider))
  providerEngine.start()

  return providerEngine
}

export const getLedgerRemoteProvider = (networkID, url) => {
  const providerEngine = new Web3ProviderEngine()
  const ledgerSubProvider = new LedgerSubprovider({
    networkId: networkID,
    ledgerEthereumClientFactoryAsync
  })

  providerEngine.addProvider(ledgerSubProvider)
  providerEngine.addProvider(new RPCSubprovider({ rpcUrl: url }))
  providerEngine.start()

  return providerEngine
}

export const getRemoteLegacyProvider = ({ url }) => {
  const providerEngine = new Web3ProviderEngine()
  providerEngine.addProvider(new RPCSubprovider({ rpcUrl: url }))
  providerEngine.start()

  return providerEngine
}
