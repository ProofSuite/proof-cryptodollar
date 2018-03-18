import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './app/App'
import store from './redux-store'

import { createBrowserHistory } from 'history'
import { syncHistoryWithStore } from 'react-router-redux'
const history = syncHistoryWithStore(createBrowserHistory(), store)

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'))
