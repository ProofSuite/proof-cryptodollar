const BigNumber = require('bignumber.js')
const chai = require('chai')
const should = chai.should

chai.use(require('chai-bignumber')())
chai.should()

const Store = artifacts.require('./Store.sol')
const DividendStorageProxy = artifacts.require('./DividendStorageProxy.sol')

contract('DividendStorageProxy', (accounts) => {
  let store
  let dividendStorageProxy

  describe('Pool index', async () => {
    beforeEach(async () => {
      store = await Store.new()
      dividendStorageProxy = await DividendStorageProxy.new()
    })

    it('should set and get current pool index', async () => {
      let poolIndex
      let expectedPoolIndex = 1

      await dividendStorageProxy.setCurrentPoolIndex(store.address, 1)
      poolIndex = await dividendStorageProxy.getCurrentPoolIndex(store.address)

      poolIndex.toNumber().should.be.equal(expectedPoolIndex)
    })

    it('should increment the current pool index', async () => {
      let poolIndex
      let increment = 10

      await dividendStorageProxy.incrementCurrentPoolIndex(store.address, increment)
      poolIndex = await dividendStorageProxy.getCurrentPoolIndex(store.address)

      poolIndex.toNumber().should.be.equal(increment)
    })
  })

  describe('Current Epoch', async () => {
    beforeEach(async () => {
      store = await Store.new()
      dividendStorageProxy = await DividendStorageProxy.new()
    })

    it('should set and get current epoch', async () => {
      let epoch
      let expectedEpoch = 1

      await dividendStorageProxy.setCurrentEpoch(store.address, 1)
      epoch = await dividendStorageProxy.getCurrentEpoch(store.address)

      epoch.toNumber().should.be.equal(expectedEpoch)
    })

    it('should increment the current epoch', async () => {
      let epoch
      let increment = 10

      await dividendStorageProxy.incrementCurrentEpoch(store.address, increment)
      epoch = await dividendStorageProxy.getCurrentEpoch(store.address)

      epoch.toNumber().should.be.equal(increment)
    })
  })

  describe('Current Pool Balance', async () => {
    beforeEach(async () => {
      store = await Store.new()
      dividendStorageProxy = await DividendStorageProxy.new()
    })

    it('should set and get current pool balance', async () => {
      let poolBalance
      let expectedPoolBalance = 1

      await dividendStorageProxy.setCurrentPoolBalance(store.address, 1)
      poolBalance = await dividendStorageProxy.getCurrentPoolBalance(store.address)

      poolBalance.toNumber().should.be.equal(expectedPoolBalance)
    })

    it('should increment the current pool balance', async () => {
      let poolBalance
      let increment = 10

      await dividendStorageProxy.incrementCurrentPoolBalance(store.address, increment)
      poolBalance = await dividendStorageProxy.getCurrentPoolBalance(store.address)

      poolBalance.toNumber().should.be.equal(increment)
    })
  })


  describe('Nth pool dividends', async() => {
    beforeEach(async () => {
      store = await Store.new()
      dividendStorageProxy = await DividendStorageProxy.new()
    })

    it('should set and get Nth pool dividends', async () => {
      let dividends
      let poolIndex = 1
      let expectedDividends = 1 * 10 ** 18

      await dividendStorageProxy.setNthPoolDividends(store.address, poolIndex, expectedDividends)
      dividends = await dividendStorageProxy.getNthPoolDividends(store.address, poolIndex)

      dividends.toNumber().should.be.equal(expectedDividends)
    })

    it('should set and get Nth pool remaining dividends', async () => {
      let storedValue
      let poolIndex = 1
      let expectedValue = 1 * 10 ** 18

      await dividendStorageProxy.setNthPoolRemainingDividends(store.address, poolIndex, expectedValue)
      storedValue = await dividendStorageProxy.getNthPoolRemainingDividends(store.address, poolIndex)

      storedValue.toNumber().should.be.equal(expectedValue)
    })
  })

  describe('Account Last withdrawal', async() => {
    beforeEach(async() => {
      store = await Store.new()
      dividendStorageProxy = await DividendStorageProxy.new()
    })

    it('should set and get the last account withdrawal', async() => {
      let account = "0x3712501089ae5b863c4ff8fc32d4193fd52519e4"
      let storedValue = 10
      let expectedValue = 1 * 10 ** 18

      await dividendStorageProxy.setAccountLastWithdrawal(store.address, account, expectedValue)
      storedValue = await await dividendStorageProxy.getAccountLastWithdrawal(store.address, account)

      storedValue.toNumber().should.be.equal(expectedValue)
    })
  })
})

