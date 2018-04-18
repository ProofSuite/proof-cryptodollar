import Web3 from 'web3'
// import Web3Legacy from 'web3-0.20'
// import * as providers from './providers'

/**
 * Provider Helpers
 * Providers compatible with web3 1.0
 */
export const getWeb3 = (getState) => {
  let { url } = getState().data.provider
  let web3 = new Web3(url || Web3.givenProvider)
  return web3
}

export const getWeb3AndProvider = (getState) => {
  let { url, networkID } = getState().data.provider
  let web3 = new Web3(url || Web3.givenProvider)
  return { web3, url, networkID }
}

export const getProviderUtils = (getState) => {
  let { url, networkID } = getState().data.provider
  let web3 = new Web3(url || Web3.givenProvider)
  return { web3, url, networkID }
}

// export const getLocalWeb3 = ({ websockets }) => {
//   const provider = providers.getLocalProvider({ websockets })
//   if (!provider) console.log('could not instantiate provider')

//   const web3 = new Web3(provider)
//   if (!web3) console.log('could not instantiate web3')
//   return web3
// }

// export const getInfuraWeb3 = ({ websockets, networkID, url }) => {
//   const provider = providers.getInfuraProvider({ websockets, networkID, url })
//   if (!provider) console.log('could not instantiate provider')

//   const web3 = new Web3(provider)
//   if (!web3) console.log('could not instantiate web3 object')
//   return web3
// }

// export const getRemoteWeb3 = ({ websockets, url }) => {
//   const provider = providers.getRemoteProvider({ websockets, url })
//   if (!provider) console.log('could not instantiate provider')

//   const web3 = new Web3(provider)
//   if (!web3) console.log('could not instantiate web3 object')

//   return web3
// }

// export const getInjectedWeb3 = () => {
//   const provider = Web3.givenProvider
//   if (!provider) console.log('no given provider found')

//   const web3 = new Web3(provider)
//   if (!web3) console.log('could not instantiate web3')

//   return web3
// }

// export const getCurrentWeb3 = () => {
//   const provider = window.web3.currentProvider
//   if (!provider) console.log('no current provider found')

//   const web3 = new Web3(provider)
//   if (!web3) console.log('could not instantiate web3')

//   return web3
// }

// export const getWeb3 = (getState) => {
//   let { type, url } = getState().data.provider
//   let web3 = new Web3(url || Web3.givenProvider)
  // type = 'local'
  // if (type === 'local') {
  //   web3 = new Web3(window.localWeb3)
  // } else if (type === 'infura') {
  //   web3 = new Web3(window.infuraWeb3)
  // } else if (type === 'remote') {
  //   web3 = new Web3(window.remoteWeb3)
  // } else {
  //   web3 = new Web3(window.web3.currentProvider)
  // }
//   return web3
// }

/**
 * Web3 Setters
 */
// export const setLocalWeb3 = ({ websockets }) => {
//   const web3 = getLocalWeb3({ websockets })
//   if (!web3) console.log('could not find local web3 object')
//   window.localWeb3 = web3
//   return web3
// }

// export const setInfuraWeb3 = ({ websockets, networkID, url }) => {
//   const web3 = getInfuraWeb3({ websockets })
//   if (!web3) console.log('could not find infura object')
//   window.infuraWeb3 = web3
//   return web3
// }

// export const setRemoteWeb3 = ({ websockets, url }) => {
//   const web3 = getRemoteWeb3({ websockets, url })
//   if (!web3) console.log('could not find remote web3')
//   window.remoteWeb3 = web3
//   return web3
// }

/**
 * Legacy providers compatible with web3 0.20
 */
// export const getLegacyWeb3 = ({ local, url }) => {
//   if (!local && !url) console.log('could not instantiate web3-0.20 object')

//   const provider = providers.getLegacyProvider({ local, url })
//   if (!provider) console.log('could not instantiate provider object')
//   const web3 = new Web3Legacy(provider)
//   if (!web3) console.log('could not instantiate web3 object')

//   return web3
// }

// export const getInjectedLegacyWeb3 = () => {
//   const provider = providers.getInjectedLegacyWeb3()
//   if (!provider) console.log('could not instantiate provider object')
//   const web3 = new Web3Legacy(provider)
//   if (!web3) console.log('could not instantiate web3 object')

//   return web3
// }

// export const getLocalLegacyWeb3 = () => {
//   const provider = providers.getLocalLegacyProvider()

//   const web3 = new Web3Legacy(provider)
//   if (!web3) console.log('could not instantiate local legacy web3 object')

//   return web3
// }

// export const getRemoteLegacyWeb3 = ({ url }) => {
//   const provider = providers.getRemoteLegacyProvider({ url })
//   if (!provider) console.log('could not instantiate remote legacy provider')

//   const web3 = new Web3Legacy(provider)
//   if (!web3) console.log('could not instantiate web3 object')

//   return web3
// }
