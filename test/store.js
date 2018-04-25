/* global  artifacts:true, web3: true, contract: true */
import chai from 'chai'
import { expectRevert } from '../scripts/helpers'

chai.use(require('chai-bignumber')(web3.BigNumber)).should()
const RewardsStorageProxy = artifacts.require('./libraries/RewardsStorageProxy.sol')
const CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
const CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
const SafeMath = artifacts.require('./libraries/SafeMath.sol')
const CryptoDollar = artifacts.require('./CryptoDollar.sol')
const CryptoFiatHub = artifacts.require('./CryptoFiatHub.sol')
const ProofToken = artifacts.require('./mocks/ProofToken.sol')
const Store = artifacts.require('./Store.sol')
const Rewards = artifacts.require('./Rewards.sol')

contract('Store', (accounts) => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub
  let admin = accounts[0]
  let hacker = accounts[1]

  describe('Authorized Address', async () => {
    beforeEach(async () => {
      store = await Store.new()
      await store.authorizeAccess(admin)
    })

    it('should be able to set, get and delete an int', async () => {
      const value = 2 ** 250
      const key = web3.sha3('test')

      await store.setInt(key, value)
      let storedValue = await store.getInt(key)
      storedValue.toNumber().should.be.equal(value)

      await store.deleteInt(key)
      storedValue = await store.getInt(key)
      storedValue.toNumber().should.be.equal(0)
    })

    it('should be able to set, get and delete an uint', async () => {
      const value = 2 ** 255
      const key = web3.sha3('test')

      await store.setUint(key, value)
      let storedValue = await store.getUint(key)
      storedValue.toNumber().should.equal(value)

      await store.deleteUint(key)
      storedValue = await store.getUint(key)
      storedValue.toNumber().should.be.equal(0)
    })

    it('should be able to set, get and delete an address', async () => {
      const value = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      const key = web3.sha3('test')
      let storedValue

      await store.setAddress(key, value)
      storedValue = await store.getAddress(key)
      storedValue.should.be.equal(value)

      await store.deleteAddress(key)
      storedValue = await store.getAddress(key)
      storedValue.should.be.equal('0x0000000000000000000000000000000000000000')
    })

    it('should set, get and delete a string', async () => {
      const value = 'hey tai'
      const key = web3.sha3('test')
      let storedValue

      await store.setString(key, value)
      storedValue = await store.getString(key)
      storedValue.should.be.equal(value)

      await store.deleteString(key)
      storedValue = await store.getString(key)
      storedValue.should.be.equal('')
    })

    it('should set, get and delete a boolean', async () => {
      const value = true
      const key = web3.sha3('test')
      let storedValue

      await store.setBool(key, value)
      storedValue = await store.getBool(key)
      storedValue.should.be.equal(value)

      await store.deleteBool(key)
      storedValue = await store.getBool(key)
      storedValue.should.be.equal(false)
    })
  })

  describe('Non-authorized Address', async () => {
    beforeEach(async () => {
      store = await Store.new()
      await store.authorizeAccess(admin)
    })

    it('should not be able to set or delete an int', async () => {
      const value = 2 ** 250
      const key = web3.sha3('test')

      await expectRevert(store.setInt(key, value, { from: hacker }))
      await store.setInt(key, value, { from: admin })
      await expectRevert(store.deleteInt(key, { from: hacker }))
    })

    it('should not be able to set or delete an uint', async () => {
      const value = 2 ** 255
      const key = web3.sha3('test')

      await expectRevert(store.setUint(key, value, { from: hacker }))
      await store.setInt(key, value, { from: admin })
      await expectRevert(store.deleteUint(key, { from: hacker }))
    })

    it('should not be able to set or delete an address', async () => {
      const value = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      const key = web3.sha3('test')

      await expectRevert(store.setAddress(key, value, { from: hacker }))
      await store.setAddress(key, value, { from: admin })
      await expectRevert(store.deleteAddress(key, { from: hacker }))
    })

    it('should not be able to set or delete a string', async () => {
      const value = 'hey tai'
      const key = web3.sha3('test')

      await expectRevert(store.setString(key, value, { from: hacker }))
      await store.setString(key, value, { from: admin })
      await expectRevert(store.deleteString(key, { from: hacker }))
    })

    it('should not be able to set or delete boolean', async () => {
      const value = true
      const key = web3.sha3('test')

      await expectRevert(store.setBool(key, value, { from: hacker }))
      await store.setBool(key, value, { from: admin })
      await expectRevert(store.deleteBool(key, { from: hacker }))
    })
  })

  describe('Proxy Access', async() => {
    beforeEach(async () => {
      // Libraries are deployed before the rest of the contracts. In the testing case, we need a clean deployment
      // state for each test so we redeploy all libraries an other contracts every time.
      // TODO Refactor. This is quite ugly.
      let deployedLibraries = await Promise.all([
        RewardsStorageProxy.new(),
        CryptoFiatStorageProxy.new(),
        CryptoDollarStorageProxy.new(),
        SafeMath.new()
      ])

      rewardsStorageProxy = deployedLibraries[0]
      cryptoFiatStorageProxy = deployedLibraries[1]
      cryptoDollarStorageProxy = deployedLibraries[2]
      safeMath = deployedLibraries[3]

      // Libraries are linked to each contract
      await Promise.all([
        ProofToken.link(SafeMath, safeMath.address),
        CryptoDollar.link(CryptoDollarStorageProxy, cryptoDollarStorageProxy.address),
        CryptoDollar.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address),
        CryptoDollar.link(SafeMath, safeMath.address),
        CryptoFiatHub.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address),
        CryptoFiatHub.link(RewardsStorageProxy, rewardsStorageProxy.address),
        CryptoFiatHub.link(SafeMath, safeMath.address),
        Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address),
        Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address),
        Rewards.link(SafeMath, safeMath.address)
      ])

      // Contracts are deployed with a blank state for each test
      store = await Store.new()
      proofToken = await ProofToken.new()
      cryptoDollar = await CryptoDollar.new(store.address)
      rewards = await Rewards.new(store.address, proofToken.address)
      cryptoFiatHub = await CryptoFiatHub.new(cryptoDollar.address, store.address, proofToken.address, rewards.address)

      /**
       * allow store access and initialize the cryptofiat system and initialize the CryptoFiatHub
       * with a 20 blocks epoch.
       * The number of blocks per epoch should be increased to reflect the production behavior.
       * The choice of 20 blocks has been made solely for testing purposes as mining the test EVM
       * requires a significant amount of time (40 blocks ~ 5-10 seconds). Final tests should be run
       * with bigger epochs.
       */
      await Promise.all([
        store.authorizeAccess(cryptoFiatHub.address),
        store.authorizeAccess(cryptoDollar.address),
        store.authorizeAccess(rewards.address),
        cryptoDollar.authorizeAccess(cryptoFiatHub.address)
      ])

      cryptoFiatHub.initialize(20, 0x0)
    })

    it('should not be accesible via cryptoFiatStorageProxy by a non-authorized address', async() => {
      await expectRevert(cryptoFiatStorageProxy.setCreationTimestamp(store.address, 1, { from: hacker }))
    })
    it('should not be accessible via cryptoDollarProxy by a non-authorized address', async() => {
      await expectRevert(cryptoDollarStorageProxy.setBalance(store.address, hacker, 1 * 10 ** 18, { from: hacker }))
    })
    it('should not be accessible via rewardsStorageProxy by a non-authorized address', async() => {
      await expectRevert(rewardsStorageProxy.setCurrentEpoch(store.address, 1, { from: hacker }))
    })
  })
})
