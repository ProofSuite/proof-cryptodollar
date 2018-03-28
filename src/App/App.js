import React, { Component } from 'react'
import DEXLayout from '../layouts/DEXLayout'
import CryptoFiatLayout from '../layouts/CryptoFiatLayout'

import { hot } from 'react-hot-loader'
import { Route, Switch, BrowserRouter } from 'react-router-dom'

// import { createBrowserHistory } from 'history'
// import { syncHistoryWithStore } from 'react-router-redux'
// import store from '../redux-store'
// const history = syncHistoryWithStore(createBrowserHistory(), store)

import 'semantic-ui-css/semantic.min.css?global'
import NavBar from '../components/common/NavBar'

class App extends Component {

  render () {
    return (
      <BrowserRouter>
        <div>
        <NavBar />
        <Switch>
          <Route exact path='/' component={CryptoFiatLayout}/>
          <Route path='/dex' component={DEXLayout}/>
        </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default hot(module)(App)
