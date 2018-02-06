var RewardsStorageProxy = artifacts.require('./libraries/RewardsStorageProxy.sol')
var CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
var CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
var SafeMath = artifacts.require('./libraries/SafeMath.sol')
var CryptoDollar = artifacts.require('./CryptoDollar.sol')
var CryptoFiatHub = artifacts.require('./CryptoFiatHub.sol')
var ProofToken = artifacts.require('./ProofToken.sol')
var Store = artifacts.require("./Store.sol");
var ProofRewards = artifacts.require("./ProofRewards.sol")


//for some reason async/await makes this file crash
module.exports = function(deployer) {

  deployer.deploy(SafeMath)
  deployer.deploy(RewardsStorageProxy)
  deployer.deploy(CryptoFiatStorageProxy)
  deployer.deploy(CryptoDollarStorageProxy)

  //link libraries to deployed contracts
  deployer.link(RewardsStorageProxy, [CryptoDollar, CryptoFiatHub, ProofRewards]);
  deployer.link(CryptoFiatStorageProxy, [CryptoDollar, CryptoFiatHub]);
  deployer.link(CryptoDollarStorageProxy, [CryptoDollar, CryptoFiatHub]);
  deployer.link(SafeMath, [CryptoDollar, CryptoFiatHub, ProofRewards]);

  deployer.deploy(Store)
    .then(() => { return deployer.deploy(ProofToken)})
    .then(() => { return deployer.deploy(CryptoDollar, Store.address)})
    .then(() => { return deployer.deploy(ProofRewards, Store.address, ProofToken.address)})
    .then(() => { return deployer.deploy(CryptoFiatHub, CryptoDollar.address, Store.address, ProofToken.address, ProofRewards.address )})
};
