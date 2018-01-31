var DividendProxyLib = artifacts.require('./libraries/DividendProxyLib.sol')
var Store = artifacts.require("./Store.sol");

module.exports = async (deployer) => {
  await deployer.deploy(Store)
  await deployer.deploy(DividendProxyLib)
  deployer.link(DividendProxyLib, Store);
};
