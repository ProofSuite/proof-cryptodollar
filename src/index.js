import React from 'react'
import { AppContainer } from 'react-hot-loader'
import { render } from 'react-dom'
import { Router, Route, IndexRoute } from 'react-router'
import { Provider } from 'react-redux'
import { createBrowserHistory } from 'history'
import { syncHistoryWithStore } from 'react-router-redux'

import App from './App/App'
import getWeb3 from './utils/getWeb3'
import store from './redux-store'

const history = syncHistoryWithStore(createBrowserHistory(), store)

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'))

// <Router history={history}>
//       <Route path="/" component={App} />
//     </Router>
