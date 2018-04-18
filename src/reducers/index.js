import { combineReducers } from 'redux'
import uiReducer from './ui'
import dataReducer from './data'

/**
 * Reducers
 *
 * Reducers are split between ui reducers and data reducers
 * UI reducers correspond to a 1-1 component mapping
 * Data reducers are mapped 1-to-N (data can be served to different components)
 *
 * Actions
 *
 * In the same way actions are divided corresponding to whether they affect the data of the application
 * or the ui-state of a certain component. Actions and action creators affecting the state of a certain
 * component are located in the folder corresponding to that component. Actions affecting general application
 * data are located in the src/actions/ folder.
 *
 */
const reducer = combineReducers({
  ui: uiReducer,
  data: dataReducer
})

export default reducer
