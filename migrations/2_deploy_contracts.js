const config = require('../config')
const RewardsStorageProxy = artifacts.require('./libraries/RewardsStorageProxy.sol')
const CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
const CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
const SafeMath = artifacts.require('./libraries/SafeMath.sol')
const CryptoDollar = artifacts.require('./CryptoDollar.sol')
const CryptoFiatHub = artifacts.require('./CryptoFiatHub.sol')
const ProofToken = artifacts.require('./mocks/ProofToken.sol')
const Store = artifacts.require("./Store.sol");
const Rewards = artifacts.require("./Rewards.sol")


//for some reason async/await makes this file crash
module.exports = function(deployer) {

  let IPFSHash = config.ipfs.TESTING_SUCCESS

  //deploy librariess
  deployer.deploy(SafeMath)
  deployer.deploy(RewardsStorageProxy)
  deployer.deploy(CryptoFiatStorageProxy)
  deployer.deploy(CryptoDollarStorageProxy)

  //link libraries to deployed contracts
  deployer.link(RewardsStorageProxy, [CryptoDollar, CryptoFiatHub, Rewards]);
  deployer.link(CryptoFiatStorageProxy, [CryptoDollar, CryptoFiatHub, Rewards]);
  deployer.link(CryptoDollarStorageProxy, [CryptoDollar, CryptoFiatHub]);
  deployer.link(SafeMath, [CryptoDollar, CryptoFiatHub, Rewards]);

  /**
   Contracts are deployed in the following order:
   - 1. Proof Token Mock
   - 2. Store
   - 3. CryptoDollar
   - 4. CryptoFiatHub
   This script is valid only for testing. For production or staging on Rinkeby,
   the ProofToken address should be the address of the Proof Token that was
   previously deployed.
   */
  deployer.deploy(ProofToken)
    .then(() => {
      return deployer.deploy(
        Store
      )})
    .then(() => {
      return deployer.deploy(
        CryptoDollar,
        Store.address
      )})
    .then(() => {
      return deployer.deploy(
        Rewards,
        Store.address,
        ProofToken.address
      )})
    .then(() => {
       return deployer.deploy(
        CryptoFiatHub,
        CryptoDollar.address,
        Store.address,
        ProofToken.address,
        Rewards.address,
    )})
    //authorize store access to the CryptoFiatHub, CryptoDollar and Rewards contracts
    .then(async() => {
      let deployedContracts = await Promise.all([
        Store.deployed(),
        CryptoDollar.deployed(),
        Rewards.deployed()
      ])
      let [ store, cryptoDollar, rewards ] = deployedContracts

      await Promise.all([
        store.authorizeAccess(CryptoFiatHub.address),
        store.authorizeAccess(CryptoDollar.address),
        store.authorizeAccess(Rewards.address),
        cryptoDollar.authorizeAccess(CryptoFiatHub.address)
      ])
    })
    /**
     * Initialize the CryptoFiatHub with a 20 blocks epoch.
     * The number of blocks per epoch should be increased to reflect the production behavior.
     * The choice of 20 blocks has been made solely for testing purposes as mining the test EVM
     * requires a significant amount of time (40 blocks ~ 5-10 seconds). Final tests should be run
     * with bigger epochs.
     */
    .then(async() => {
      let cryptoFiatHub = await CryptoFiatHub.deployed()
      await cryptoFiatHub.initialize(20)
      await cryptoFiatHub.initializeOraclize(IPFSHash, true)
      await cryptoFiatHub.capitalize({ value: 10 * 10 ** 18 })
    })
};
