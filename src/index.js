import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import AppContainer from './app/AppContainer'
import store from './redux-store'

// import { whyDidYouUpdate } from 'why-did-you-update'
// if (process.env.NODE_ENV !== 'production') {
//   whyDidYouUpdate(React)
// }

render((
  <Provider store={store}>
    <AppContainer />
  </Provider>
), document.getElementById('root'))
