/* global  artifacts:true, web3: true, contract: true */
import chai from 'chai'

chai.use(require('chai-bignumber')(web3.BigNumber)).should()
const Store = artifacts.require('./Store.sol')
const RewardsStorageProxy = artifacts.require('./RewardsStorageProxy.sol')

contract('RewardsStorageProxy', (accounts) => {
  let store
  let rewardsStorageProxy

  beforeEach(async() => {
    store = await Store.new()
    rewardsStorageProxy = await RewardsStorageProxy.new()
    await store.authorizeAccess(rewardsStorageProxy.address)
  })

  describe('Pool index', async () => {
    it('should set and get current pool index', async () => {
      let poolIndex
      let expectedPoolIndex = 1

      await rewardsStorageProxy.setCurrentPoolIndex(store.address, 1)
      poolIndex = await rewardsStorageProxy.getCurrentPoolIndex(store.address)
      poolIndex.should.be.bignumber.equal(expectedPoolIndex)
    })

    it('should increment the current pool index', async () => {
      let poolIndex
      let increment = 10

      await rewardsStorageProxy.incrementCurrentPoolIndex(store.address, increment)
      poolIndex = await rewardsStorageProxy.getCurrentPoolIndex(store.address)
      poolIndex.should.be.bignumber.equal(increment)
    })
  })

  describe('Current Epoch', async () => {
    it('should set and get current epoch', async () => {
      let epoch
      let expectedEpoch = 1

      await rewardsStorageProxy.setCurrentEpoch(store.address, 1)
      epoch = await rewardsStorageProxy.getCurrentEpoch(store.address)
      epoch.should.be.bignumber.equal(expectedEpoch)
    })

    it('should increment the current epoch', async () => {
      let epoch
      let increment = 10

      await rewardsStorageProxy.incrementCurrentEpoch(store.address, increment)
      epoch = await rewardsStorageProxy.getCurrentEpoch(store.address)
      epoch.should.be.bignumber.equal(increment)
    })
  })

  describe('Current Pool Balance', async () => {
    it('should set and get current pool balance', async () => {
      let poolBalance
      let expectedPoolBalance = 1

      await rewardsStorageProxy.setCurrentPoolBalance(store.address, 1)
      poolBalance = await rewardsStorageProxy.getCurrentPoolBalance(store.address)
      poolBalance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increment the current pool balance', async () => {
      let poolBalance
      let increment = 10

      await rewardsStorageProxy.incrementCurrentPoolBalance(store.address, increment)
      poolBalance = await rewardsStorageProxy.getCurrentPoolBalance(store.address)
      poolBalance.should.be.bignumber.equal(increment)
    })
  })

  describe('Nth pool dividends', async() => {
    it('should set and get Nth pool dividends', async () => {
      let dividends
      let poolIndex = 1
      let expectedDividends = 1 * 10 ** 18

      await rewardsStorageProxy.setNthPoolBalance(store.address, poolIndex, expectedDividends)
      dividends = await rewardsStorageProxy.getNthPoolBalance(store.address, poolIndex)
      dividends.should.be.bignumber.equal(expectedDividends)
    })

    it('should set and get Nth pool remaining dividends', async () => {
      let storedValue
      let poolIndex = 1
      let expectedValue = 1 * 10 ** 18

      await rewardsStorageProxy.setNthPoolRemainingDividends(store.address, poolIndex, expectedValue)
      storedValue = await rewardsStorageProxy.getNthPoolRemainingDividends(store.address, poolIndex)
      storedValue.should.be.bignumber.equal(expectedValue)
    })
  })

  describe('Account Last withdrawal', async() => {
    it('should set and get the last account withdrawal', async() => {
      let account = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      let storedValue = 10
      let expectedValue = 1 * 10 ** 18

      await rewardsStorageProxy.setAccountLastWithdrawal(store.address, account, expectedValue)
      storedValue = await await rewardsStorageProxy.getAccountLastWithdrawal(store.address, account)
      storedValue.should.be.bignumber.equal(expectedValue)
    })
  })
})

