import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './app/App'
import store from './redux-store'

// import { syncHistoryWithStore } from 'react-router-redux'
// import { createBrowserHistory } from 'history'
// const history = syncHistoryWithStore(createBrowserHistory(), store)

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'))
