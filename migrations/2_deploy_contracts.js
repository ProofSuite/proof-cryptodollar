var DividendStorageProxy = artifacts.require('./libraries/DividendStorageProxy.sol')
var CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
var CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
var SafeMath = artifacts.require('./libraries/SafeMath.sol')
var CryptoDollar = artifacts.require('./CryptoDollar.sol')
var Store = artifacts.require("./Store.sol");

module.exports = function(deployer) {

  deployer.deploy(SafeMath)
  deployer.deploy(DividendStorageProxy)
  deployer.deploy(CryptoFiatStorageProxy)
  deployer.deploy(CryptoDollarStorageProxy)

  //link libraries to deployed contracts
  deployer.link(DividendStorageProxy, CryptoDollar);
  deployer.link(CryptoFiatStorageProxy, CryptoDollar);
  deployer.link(CryptoDollarStorageProxy, CryptoDollar);
  deployer.link(SafeMath, CryptoDollar);

  deployer.deploy(Store).then(() => {
    return deployer.deploy(CryptoDollar, Store.address)
  })
};
