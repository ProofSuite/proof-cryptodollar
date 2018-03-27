import Web3 from 'web3'
import Web3ProviderEngine from 'web3-provider-engine'
import { RPCSubprovider } from 'web3-provider-engine/subproviders/rpc'
import {
  ledgerEthereumBrowserClientFactoryAsync as ledgerEthereumClientFactoryAsync,
  LedgerSubprovider,
  InjectedWeb3Subprovider
} from '@0xproject/subproviders'

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
    provider = new Web3.providers.HttpProvider('http://localhost:8546')
  } else {
    provider = new Web3.providers.WebsocketProvider('ws://localhost:8546')
  }

  if (!provider) console.log('could not connect to local provider')
  return provider
}

// Legacy Providers (useful for interacting with 0x.js)
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

  providerEngine.addEngine(new InjectedWeb3Subprovider(window.web3.currentProvider))
  providerEngine.addEngine(new RPCSubprovider({ rpcUrl: 'http://localhost:8545' }))
  providerEngine.start()

  return providerEngine
}

export const getLegacyInjectedProvider = () => {
  const providerEngine = new Web3ProviderEngine()

  providerEngine.addProvider(new InjectedWeb3Subprovider(window.web3.currentProvider))
  providerEngine.addProvider(new RPCSubprovider({ rpcUrl: 'http://localhost:8545' }))
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
