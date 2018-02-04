var DividendStorageProxy = artifacts.require('./libraries/DividendStorageProxy.sol')
var CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
var CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
var SafeMath = artifacts.require('./libraries/SafeMath.sol')
var CryptoDollar = artifacts.require('./CryptoDollar.sol')
var Store = artifacts.require("./Store.sol");

module.exports = async (deployer) => {

  await deployer.deploy(Store)
  await deployer.deploy(SafeMath)
  await deployer.deploy(DividendStorageProxy)
  await deployer.deploy(CryptoFiatStorageProxy)
  await deployer.deploy(CryptoDollarStorageProxy)
  await deployer.deploy(CryptoDollar)

  //link libraries to deployed contracts
  deployer.link(DividendStorageProxy, Store);
  deployer.link(CryptoFiatStorageProxy, Store);
  deployer.link(CryptoDollarStorageProxy, Store);
  deployer.link(DividendStorageProxy, CryptoDollar)
  deployer.link(CryptoFiatStorageProxy, CryptoDollar)
  deployer.link(CryptoDollarStorageProxy, CryptoDollar)
  deployer.link(SafeMath, CryptoDollar)
};
