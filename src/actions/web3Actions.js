import { getWeb3 } from '../helpers/web3'

export const SET_WEB3 = 'SET_WEB3'
export const SET_WEB3_ERROR = 'SET_WEB3_ERROR'
export const SET_WEB3_DEFAULT = 'SET_WEB3_DEFAULT'

export const setWeb3Error = error => ({ type: SET_WEB3_ERROR, payload: { error } })
export const setWeb3 = () => ({ type: SET_WEB3 })

export const initializeWeb3 = () => (dispatch, getState) => {
  let web3 = getWeb3(getState)
  if (web3 !== undefined) dispatch(setWeb3())
}

// export const setInfuraWeb3 = ({ websockets, networkID, url }) => {
//   const web3 = getInfuraWeb3({ websockets, networkID, url })
//   window.infuraWeb3 = web3
// }

// export const setRemoteWeb3 = ({ websockets, url }) => {
//   const web3 = getRemoteWeb3({ websockets, url })
//   window.remoteWeb3 = web3
// }

// export const setLegacyWeb3 = ({ local, url }) => {
//   const web3 = getLegacyWeb3({ local, url })
//   window.legacyWeb3 = web3
// }

// export const getWeb3 = (getState) => {
//   let { type } = getState().data.provider
//   let web3
//   if (type === 'local') {
//     web3 = new Web3(window.localWeb3)
//   } else if (type === 'infura') {
//     web3 = new Web3(window.infuraWeb3)
//   } else if (type === 'remote') {
//     web3 = new Web3(window.remoteWeb3)
//   } else {
//     web3 = new Web3(window.web3.currentProvider)
//   }
//   console.log(web3)
//   return web3
// }
