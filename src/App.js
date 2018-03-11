import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
// import contract from 'truffle-contract'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null
    }
  }

  componentWillMount () {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      // this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  // async instantiateContract () {
  //   const simpleStorage = contract(SimpleStorageContract)
  //   simpleStorage.setProvider(this.state.web3.currentProvider)

  //   // Declaring this for later so we can chain functions on SimpleStorage.
  //   let simpleStorageInstance = await simpleStorage.deployed()

  //   let accounts = this.state.web3.eth.accounts

  //   await simpleStorageInstance.set(5, { from: accounts[0] })
  //   let result = await simpleStorageInstance.get.call(accounts[0])
  //   this.setState({ storageValue: result.c[0] })
  // }

  render () {
    return (
      <div className='App'>
        <main className='container'>
          <div>
            <div>
              <p>The stored value is: {this.state.storageValue}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

export default App
