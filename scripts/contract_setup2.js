module.exports = function (callback) {
  const CryptoDollarTokenArtifact = require('../build/contracts/CryptoDollarToken.json')
  const CryptoEuroTokenArtifact = require('../build/contract/CryptoEuroToken.json')
  const CryptoFiatArtifact = require('../build/contracts/CryptoFiat.json')

  const Web3 = require('web3')
  const provider = new Web3.providers.HttpProvider('http://localhost:8545')
  const web3 = new Web3(provider)

  const contract = require('truffle-contract')

  let cryptoFiatContract = contract(CryptoFiatArtifact)
  let cryptoDollarContract = contract(CryptoDollarTokenArtifact)
  let cryptoEuroContract = contract(CryptoEuroTokenArtifact)

  cryptoFiatContract.setProvider(web3.currentProvider)
  cryptoDollarContract.setProvider(web3.currentProvider)
  cryptoEuroContract.setProvider(web3.currentProvider)

  callback()
}
