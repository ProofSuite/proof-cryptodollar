export const TOKEN_LOADING = 'TOKEN_LOADING'
export const TOKEN_ERROR = 'TOKEN_ERROR'
export const UPDATE_TOKEN = 'UPDATE_TOKEN'
export const DELETE_TOKEN = 'DELETE_TOKEN'

export const tokenLoading = () => dispatch =>
  dispatch({ type: TOKEN_LOADING })

export const tokenError = () => dispatch =>
  dispatch({ type: TOKEN_ERROR })

export const updateToken = () => dispatch =>
  dispatch({ type: UPDATE_TOKEN })

export const deleteToken = () => dispatch =>
  dispatch({ type: DELETE_TOKEN })
