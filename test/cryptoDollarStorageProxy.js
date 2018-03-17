/* global  artifacts:true, web3: true, contract: true */
import chai from 'chai'

chai.use(require('chai-bignumber')(web3.BigNumber))
chai.should()

const Store = artifacts.require('./Store.sol')
const CryptoDollarStorageProxy = artifacts.require('./CryptoDollarStorageProxy.sol')

contract('CryptoDollarStorageProxy', (accounts) => {
  let store
  let cryptoDollarStorageProxy

  beforeEach(async() => {
    store = await Store.new()
    cryptoDollarStorageProxy = await CryptoDollarStorageProxy.new()
    await store.authorizeAccess(cryptoDollarStorageProxy.address)
  })

  describe('Balance', async () => {
    it('should set and get start timestamp', async () => {
      let storedValue
      let account = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      let expectedValue = new web3.BigNumber(10 * 10 ** 18)

      await cryptoDollarStorageProxy.setBalance(store.address, account, expectedValue)
      storedValue = await cryptoDollarStorageProxy.getBalance(store.address, account)
      storedValue.should.be.bignumber.equals(expectedValue)
    })

    it('should increment and decrement balance', async () => {
      let storedValue
      let account = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      let increment = new web3.BigNumber(2 * 10 ** 18)
      let decrement = new web3.BigNumber(1 * 10 ** 18)

      await cryptoDollarStorageProxy.incrementBalance(store.address, account, increment)
      storedValue = await cryptoDollarStorageProxy.getBalance(store.address, account)
      storedValue.should.be.bignumber.equal(increment)

      await cryptoDollarStorageProxy.decrementBalance(store.address, account, decrement)
      storedValue = await cryptoDollarStorageProxy.getBalance(store.address, account)
      storedValue.should.be.bignumber.equals(increment - decrement)
    })
  })

  describe('Reserved Ether', async () => {
    it('should set and get reserved ether', async () => {
      let storedValue
      let account = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      let expectedValue = new web3.BigNumber(10 * 10 ** 18)

      await cryptoDollarStorageProxy.setReservedEther(store.address, account, expectedValue)
      storedValue = await cryptoDollarStorageProxy.getReservedEther(store.address, account)
      storedValue.should.be.bignumber.equal(expectedValue)
    })

    it('should increment and decrement reserved ether', async () => {
      let storedValue
      let account = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      let increment = new web3.BigNumber(2 * 10 ** 18)
      let decrement = new web3.BigNumber(1 * 10 ** 18)

      await cryptoDollarStorageProxy.incrementReservedEther(store.address, account, increment)
      storedValue = await cryptoDollarStorageProxy.getReservedEther(store.address, account)
      storedValue.should.be.bignumber.equal(increment)

      await cryptoDollarStorageProxy.decrementReservedEther(store.address, account, decrement)
      storedValue = await cryptoDollarStorageProxy.getReservedEther(store.address, account)
      storedValue.should.be.bignumber.equal(increment - decrement)
    })
  })

  describe('Total Supply', async () => {
    it('should set and get total supply', async () => {
      let storedValue
      let expectedValue = new web3.BigNumber(10 * 10 ** 18)

      await cryptoDollarStorageProxy.setTotalSupply(store.address, expectedValue)
      storedValue = await cryptoDollarStorageProxy.getTotalSupply(store.address)
      storedValue.should.be.bignumber.equal(expectedValue)
    })

    it('should increment and decrement total supply', async () => {
      let storedValue
      let increment = new web3.BigNumber(2 * 10 ** 18)
      let decrement = new web3.BigNumber(1 * 10 ** 18)

      await cryptoDollarStorageProxy.incrementTotalSupply(store.address, increment)
      storedValue = await cryptoDollarStorageProxy.getTotalSupply(store.address)
      storedValue.should.be.bignumber.equal(increment)

      await cryptoDollarStorageProxy.decrementTotalSupply(store.address, decrement)
      storedValue = await cryptoDollarStorageProxy.getTotalSupply(store.address)
      storedValue.should.be.bignumber.equal(increment - decrement)
    })
  })

  describe('Allowance', async () => {
    it('should set and get allowance', async () => {
      let sender = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      let receiver = '0x6fd88996458fd01546c060973b6578ca27bbbe59'
      let storedValue
      let expectedValue = new web3.BigNumber(10 * 10 ** 18)

      await cryptoDollarStorageProxy.setAllowance(store.address, sender, receiver, expectedValue)
      storedValue = await cryptoDollarStorageProxy.getAllowance(store.address, sender, receiver)
      storedValue.should.be.bignumber.equal(expectedValue)
    })

    it('should increment and decrement allowance', async () => {
      let storedValue
      let sender = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      let receiver = '0x6fd88996458fd01546c060973b6578ca27bbbe59'
      let increment = new web3.BigNumber(2 * 10 ** 18)
      let decrement = new web3.BigNumber(1 * 10 ** 18)

      await cryptoDollarStorageProxy.incrementAllowance(store.address, sender, receiver, increment)
      storedValue = await cryptoDollarStorageProxy.getAllowance(store.address, sender, receiver)
      storedValue.should.be.bignumber.equal(increment)

      await cryptoDollarStorageProxy.decrementAllowance(store.address, sender, receiver, decrement)
      storedValue = await cryptoDollarStorageProxy.getAllowance(store.address, sender, receiver)
      storedValue.should.be.bignumber.equal(increment - decrement)
    })
  })
})

