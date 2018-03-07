let config = {
  infura: {
    ethereum: 'https://mainnet.infura.io/Oi27hEUIuGqMsrYGpI7e',
    ropsten: 'https://ropsten.infura.io/Oi27hEUIuGqMsrYGpI7e',
    rinkeby: 'https://rinkeby.infura.io/Oi27hEUIuGqMsrYGpI7e',
    kovan: 'https://kovan.infura.io/Oi27hEUIuGqMsrYGpI7e'
  },
  constants: {
    DEFAULT_GAS: 6 * 10 ** 6,
    MAX_GAS: 6 * 10 ** 6,
    DEFAULT_LOW_GAS_PRICE: 0.1 * 10 ** 9,
    DEFAULT_GAS_PRICE: 2 * 10 ** 9,
    DEFAULT_HIGH_GAS_PRICE: 5 * 10 ** 9,
    TOKENS_ALLOCATED_TO_PROOF: 1181031 * (10 ** 18),
    DECIMALS_POINTS: 10 ** 18,
    TOKEN_UNITS: 10 ** 18,
    ETHER: 10 ** 18
  },
  ipfs: {
    production: 'QmRKF8ctYqRnKbkeZUVsco2CWdRz5P7AWQqHu1cmtxA6jE',
    testing: 'QmSv7qRz7QA4j81G8zBpkB2km7d7SwCDd5aZv3s9rnWfzW'
  },
  addresses: {
    development: {
      WALLET_ADDRESS: '',
      TOKEN_WALLET_ADDRESS: ''
    },
    rinkeby: {
      WALLET_ADDRESS: '',
      TOKEN_WALLET_ADDRESS: ''
    },
    ropsten: {
      WALLET_ADDRESS: '',
      TOKEN_WALLET_ADDRESS: ''
    },
    ethereum: {
      WALLET_ADDRESS: '',
      TOKEN_WALLET_ADDRESS: ''
    }
  }
}

module.exports = config