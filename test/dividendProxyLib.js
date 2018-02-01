const BigNumber = require('bignumber.js')
const chai = require('chai')
const should = chai.should

chai.use(require('chai-bignumber')())
chai.should()

const Store = artifacts.require('./Store.sol')
const DividendProxyLib = artifacts.require('./DividendProxyLib.sol')

contract('Store', (accounts) => {
  let store
  let dividendProxyLib

  describe('Pool index', async () => {
    beforeEach(async () => {
      store = await Store.new()
      dividendProxyLib = await DividendProxyLib.new()
    })

    it('should set and get current pool index', async () => {
      let poolIndex
      let expectedPoolIndex = 1

      await dividendProxyLib.setCurrentPoolIndex(store.address, 1)
      poolIndex = await dividendProxyLib.getCurrentPoolIndex(store.address)

      poolIndex.toNumber().should.be.equal(expectedPoolIndex)
    })

    it('should increment the current pool index', async () => {
      let poolIndex
      let increment = 10

      await dividendProxyLib.incrementCurrentPoolIndex(store.address, increment)
      poolIndex = await dividendProxyLib.getCurrentPoolIndex(store.address)

      poolIndex.toNumber().should.be.equal(increment)
    })
  })

  describe('Current Epoch', async () => {
    beforeEach(async () => {
      store = await Store.new()
      dividendProxyLib = await DividendProxyLib.new()
    })

    it('should set and get current epoch', async () => {
      let epoch
      let expectedEpoch = 1

      await dividendProxyLib.setCurrentEpoch(store.address, 1)
      epoch = await dividendProxyLib.getCurrentEpoch(store.address)

      epoch.toNumber().should.be.equal(expectedEpoch)
    })

    it('should increment the current epoch', async () => {
      let epoch
      let increment = 10

      await dividendProxyLib.incrementCurrentEpoch(store.address, increment)
      epoch = await dividendProxyLib.getCurrentEpoch(store.address)

      epoch.toNumber().should.be.equal(increment)
    })
  })

  describe('Current Pool Balance', async () => {
    beforeEach(async () => {
      store = await Store.new()
      dividendProxyLib = await DividendProxyLib.new()
    })

    it('should set and get current pool balance', async () => {
      let poolBalance
      let expectedPoolBalance = 1

      await dividendProxyLib.setCurrentPoolBalance(store.address, 1)
      poolBalance = await dividendProxyLib.getCurrentPoolBalance(store.address)

      poolBalance.toNumber().should.be.equal(expectedPoolBalance)
    })

    it('should increment the current pool balance', async () => {
      let poolBalance
      let increment = 10

      await dividendProxyLib.incrementCurrentPoolBalance(store.address, increment)
      poolBalance = await dividendProxyLib.getCurrentPoolBalance(store.address)

      poolBalance.toNumber().should.be.equal(increment)
    })
  })


  describe('Nth pool dividends', async() => {
    beforeEach(async () => {
      store = await Store.new()
      dividendProxyLib = await DividendProxyLib.new()
    })

    it('should set and get Nth pool dividends', async () => {
      let dividends
      let poolIndex = 1
      let expectedDividends = 1 * 10 ** 18

      await dividendProxyLib.setNthPoolDividends(store.address, poolIndex, expectedDividends)
      dividends = await dividendProxyLib.getNthPoolDividends(store.address, poolIndex)

      dividends.toNumber().should.be.equal(expectedDividends)
    })

    it('should set and get Nth pool remaining dividends', async () => {
      let storedValue
      let poolIndex = 1
      let expectedValue = 1 * 10 ** 18

      await dividendProxyLib.setNthPoolRemainingDividends(store.address, poolIndex, expectedValue)
      storedValue = await dividendProxyLib.getNthPoolRemainingDividends(store.address, poolIndex)

      storedValue.toNumber().should.be.equal(expectedValue)
    })
  })

  describe('Account Last withdrawal', async() => {
    beforeEach(async() => {
      store = await Store.new()
      dividendProxyLib = await DividendProxyLib.new()
    })

    it('should set and get the last account withdrawal', async() => {
      let account = "0x3712501089ae5b863c4ff8fc32d4193fd52519e4"
      let storedValue = 10
      let expectedValue = 1 * 10 ** 18

      await dividendProxyLib.setAccountLastWithdrawal(store.address, account, expectedValue)
      storedValue = await await dividendProxyLib.getAccountLastWithdrawal(store.address, account)

      storedValue.toNumber().should.be.equal(expectedValue)
    })
  })
})

