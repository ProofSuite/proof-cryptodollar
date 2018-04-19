// Allows us to use ES6 in our migrations and tests.
require('dotenv').config()
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
      network_id: '1000',
      gas: config.constants.MAX_GAS,
      gasPrice: config.constants.DEFAULT_GAS_PRICE,
      from: '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39'  // testprc main account here
    },
    development_geth: {
      host: 'localhost',
      port: 8545,
      network_id: '8888',
      gas: config.constants.MAX_GAS,
      gasPrice: config.constants.DEFAULT_GAS_PRICE,
      from: '0xe8e84ee367bc63ddb38d3d01bccef106c194dc47'
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
      gas: config.constants.MAX_GAS,
      gasPrice: config.constants.DEFAULT_GAS_PRICE,
      network_id: '3'
    },
    rinkeby: {
      provider: new LightWalletProvider({
        keystore: private.rinkeby.keystore,
        password: private.rinkeby.password,
        rpcUrl: config.infura.rinkeby
      }),
      gas: config.constants.MAX_GAS,
      gasPrice: config.constants.DEFAULT_GAS_PRICE,
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