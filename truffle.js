// Allows us to use ES6 in our migrations and tests.
var config = require('./config')
var private = require('./private-config')

require('babel-register')
require('babel-polyfill')

const LightWalletProvider = require('@digix/truffle-lightwallet-provider')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: config.constants.MAX_GAS,
      gasPrice: config.constants.DEFAULT_GAS_PRICE,
      from: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39'  // testprc main account here
    },
    ethereum: {
      provider: new LightWalletProvider({
        keystore: private.ethereum.keystore,
        password: private.ethereum.password,
        rpcUrl: config.infura.ethereum
      }),
      network_id: '1',
      gas: config.constants.MAX_GAS,
      gasPrice: config.constants.DEFAULT_GAS_PRICE
    },
    ropsten: {
      provider: new LightWalletProvider({
        keystore: private.ropsten.keystore,
        password: private.ropsten.password,
        rpcUrl: config.infura.ropsten
      }),
      network_id: '3'
    },
    rinkeby: {
      provider: new LightWalletProvider({
        keystore: private.rinkeby.keystore,
        password: private.rinkeby.password,
        rpcUrl: config.infura.rinkeby
      }),
      network_id: '4'
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01
    }
  }
}