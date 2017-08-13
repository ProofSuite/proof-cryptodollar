const CryptoDollarTokenArtifact = require('./build/contracts/CryptoDollarToken.json')
const CryptoEuroTokenArtifact = require('./build/contracts/CryptoEuroToken.json')
const CryptoFiatArtifact = require('./build/contracts/CryptoFiat.json')

global.Web3 = require('web3')
global.provider = new global.Web3.providers.HttpProvider('http://localhost:8545')
global.web3 = new Web3(global.provider)

const contract = require('truffle-contract')

let cryptoFiatContract = contract(CryptoFiatArtifact)
let cryptoDollarContract = contract(CryptoDollarTokenArtifact)
let cryptoEuroContract = contract(CryptoEuroTokenArtifact)

cryptoFiatContract.setProvider(global.web3.currentProvider)
cryptoDollarContract.setProvider(global.web3.currentProvider)
cryptoEuroContract.setProvider(global.web3.currentProvider)

let txn_deploy1 = await cryptoFiatContract.deployed().then(function(instance) { global.cryptoFiat = instance });
let txn_deploy2 = await cryptoDollarContract.deployed().then(function(instance) { global.cryptoDollar = instance });
let txn_deploy3 = await cryptoEuroContract.deployed().then(function(instance) {global.cryptoEuro = instance });


