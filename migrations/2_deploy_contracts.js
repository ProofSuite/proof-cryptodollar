var DividendStorageProxy = artifacts.require('./libraries/DividendStorageProxy.sol')
var CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
var CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
var Store = artifacts.require("./Store.sol");

module.exports = async (deployer) => {
  await deployer.deploy(Store)
  await deployer.deploy(DividendStorageProxy)
  await deployer.deploy(CryptoFiatStorageProxy)
  await deployer.deploy(CryptoDollarStorageProxy)
  deployer.link(DividendStorageProxy, Store);
  deployer.link(CryptoFiatStorageProxy, Store);
  deployer.link(CryptoDollarStorageProxy, Store);
};
