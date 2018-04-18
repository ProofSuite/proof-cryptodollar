export const WALLETS_LOADING = 'WALLETS_LOADING'
export const WALLETS_ERROR = 'WALLETS_ERROR'
export const ADD_WALLET = 'ADD_WALLET'
export const ADD_WALLETS = 'ADD_WALLETS'
export const DELETE_WALLET = 'DELETE_WALLET'
export const DELETE_WALLETS = 'DELETE_WALLETS'
export const SET_DEFAULT_WALLET = 'SET_DEFAULT_WALLET'
export const WALLET_AUTHENTICATING = 'WALLET_AUTHENTICATING'
export const WALLET_AUTHENTICATED = 'WALLET_AUTHENTICATED'
export const WALLET_AUTHENTICATION_ERROR = 'WALLET_AUTHENTICATION_ERROR'
export const WALLET_UNAUTHENTICATE = 'WALLET_UNAUTHENTICATE'

export const walletsLoading = () => ({ type: WALLETS_LOADING })
export const walletsError = (error) => ({ type: WALLETS_ERROR, payload: { error } })
export const addWallet = ({ address, serialized }) => ({ type: ADD_WALLET, payload: { address, serialized } })
export const addWallets = (wallets) => ({ type: ADD_WALLETS, payload: { wallets } })
export const deleteWallet = ({ address }) => ({ type: DELETE_WALLET, payload: { address } })
export const deleteWallets = ({ addresses }) => ({ type: DELETE_WALLETS, payload: { addresses } })
export const setDefaultWallet = ({ defaultWallet }) => ({ type: SET_DEFAULT_WALLET, payload: { defaultWallet } })

export const walletAuthenticating = () => ({
  type: WALLET_AUTHENTICATING
})
export const walletAuthenticated = () => ({
  type: WALLET_AUTHENTICATED
})
export const walletAuthenticationError = error => ({
  type: WALLET_AUTHENTICATION_ERROR,
  payload: { error }
})

export const unAuthenticateWallet = () => (dispatch) => {
  dispatch({ type: WALLET_UNAUTHENTICATE })
}

export const createWallet = (address, serialized) => (dispatch) => {
  try {
    dispatch(addWallet({ address, serialized }))
  } catch (error) {
    dispatch(walletsError(error.message))
  }
}

export const importWallet = (wallets) => (dispatch) => {
  try {
    dispatch(addWallets(wallets))
  } catch (error) {
    dispatch(walletsError(error.message))
  }
}

export const removeWallets = (addresses) => (dispatch) => {
  try {
    dispatch(deleteWallets({ addresses }))
  } catch (error) {
    dispatch(walletsError(error.message))
  }
}
