import React, { Component } from 'react'
import DEXLayout from '../layouts/DEXLayout'
import CryptoFiatLayout from '../layouts/CryptoFiatLayout'
import SettingsLayout from '../layouts/SettingsLayout'
import TestLayout from '../layouts/TestLayout'
import PropTypes from 'prop-types'

import { hot } from 'react-hot-loader'
import { Route, Switch, BrowserRouter } from 'react-router-dom'

// import { createBrowserHistory } from 'history'
// import { syncHistoryWithStore } from 'react-router-redux'
// import store from '../redux-store'
// const history = syncHistoryWithStore(createBrowserHistory(), store)

import 'semantic-ui-css/semantic.min.css?global'
import 'antd/dist/antd.css?global'
import NavBar from '../components/common/NavBar'

class App extends Component {

  componentDidMount () {
    this.props.initializeWeb3()
    this.props.queryAccounts()
  }

  render () {
    return (
      <BrowserRouter>
        <div>
        <NavBar />
        <Switch>
          <Route exact path='/' component={CryptoFiatLayout}/>
          <Route path='/dex' component={DEXLayout}/>
          <Route path='/settings' component={SettingsLayout}/>
          <Route path='/test' component={TestLayout} />
        </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

App.propTypes = {
  initializeWeb3: PropTypes.func,
  queryAccounts: PropTypes.func
}

export default hot(module)(App)
