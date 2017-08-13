//small script that sets up the contract working environment.
//returns 3 contract instances cryptoFiat, cryptoDollar, cryptoEuro (truffle contract instances)

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

let cryptoFiat = await cryptoFiatContract.deployed();

cryptoEuroTokenAddress = await cryptoFiat.cryptoEuroToken();
cryptoDollarTokenAddress = await cryptoFiat.cryptoDollarToken();

cryptoEuro = cryptoEuroContract.at(cryptoEuroTokenAddress);
cryptoDollar = cryptoDollarContract.at(cryptoDollarTokenAddress);

