/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../scripts/constants'
import { getWeiBalance } from '../scripts/helpers'
import { watchNextEvent } from '../scripts/events'

chai.use(chaiAsPromised)
    .use(require('chai-bignumber')(web3.BigNumber))
    .should()

const should = chai.should()
const RewardsStorageProxy = artifacts.require('./libraries/RewardsStorageProxy.sol')
const CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
const CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
const SafeMath = artifacts.require('./libraries/SafeMath.sol')
const CryptoDollar = artifacts.require('./CryptoDollar.sol')
const CryptoFiatHub = artifacts.require('./CryptoFiatHub.sol')
const ProofToken = artifacts.require('./mocks/ProofToken.sol')
const Store = artifacts.require('./Store.sol')
const Rewards = artifacts.require('./Rewards.sol')

contract('Cryptofiat Hub', (accounts) => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub
  let wallet1 = accounts[1]
  let wallet2 = accounts[2]
  let oraclize = accounts[3]

  let exchangeRate = {
    string: '100000',
    number: 100000
  }

  let payment = 1 * ether
  let collateral = 1 * ether
  let bufferFee = 0.005 * payment
  let rewardsFee = 0.005 * payment
  let defaultGasPrice = 10 * 10 ** 9
  let defaultOrder = { from: wallet1, value: 1 * ether, gasPrice: defaultGasPrice }
  let defaultSellOrder = { from: wallet1, gasPrice: defaultGasPrice }
  let oraclizeFee = 5385000000000000

  /**
   * The following tests are an attempt at correctly modeling the behavior of the CryptoFiatHub smart-contract.
   * When calling functions such as buyCryptoDollar or sellCryptoDollar, the oraclize call is skipped. The
   * oraclize callback is then replaced by a call to the __callback function from an arbitrary function
   */
  beforeEach(async () => {
    // Libraries are deployed before the rest of the contracts. In the testing case, we need a clean deployment
    // state for each test so we redeploy all libraries an other contracts every time.
    rewardsStorageProxy = await RewardsStorageProxy.new()
    cryptoFiatStorageProxy = await CryptoFiatStorageProxy.new()
    cryptoDollarStorageProxy = await CryptoDollarStorageProxy.new()
    safeMath = await SafeMath.new()

    // Link Libraries
    await ProofToken.link(SafeMath, safeMath.address)
    await CryptoDollar.link(CryptoDollarStorageProxy, cryptoDollarStorageProxy.address)
    await CryptoDollar.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
    await CryptoDollar.link(SafeMath, safeMath.address)
    await CryptoFiatHub.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
    await CryptoFiatHub.link(RewardsStorageProxy, cryptoFiatStorageProxy.address)
    await CryptoFiatHub.link(SafeMath, safeMath.address)
    await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
    await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
    await Rewards.link(SafeMath, safeMath.address)

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
    await store.authorizeAccess(cryptoFiatHub.address)
    await store.authorizeAccess(cryptoDollar.address)
    await store.authorizeAccess(rewards.address)
    await cryptoDollar.authorizeAccess(cryptoFiatHub.address)
    await cryptoFiatHub.initialize(20)
  })

  describe('State variables', async () => {
    it('should set the initial blocknumber', async () => {
      let blockNumber = await cryptoFiatStorageProxy.getCreationBlockNumber(store.address)
      blockNumber.should.be.not.equal(0)
    })

    it('should set the Proof Token reference', async() => {
      let address = await cryptoFiatHub.proofToken.call()
      address.should.not.equal(0x0)
    })

    it('should set the CryptoDollar Token reference', async() => {
      let address = await cryptoFiatHub.cryptoDollar.call()
      address.should.not.equal(0x0)
    })

    it('should set the Store reference', async() => {
      let address = await cryptoFiatHub.store.call()
      address.should.not.equal(0x0)
    })
  })

  describe('Buying Tokens', async () => {

    it('should be able to buy CryptoDollar tokens', async() => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder).should.be.fulfilled
    })

    it('should increase the rewards contract balance by 0.5% of investment value', async () => {
      let initialBalance = await getWeiBalance(rewards.address)
      let expectedPoolBalance = initialBalance + rewardsFee

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string)

      let balance = await getWeiBalance(rewards.address)
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the rewards current pool balance by 0.5% of investment value', async () => {
      let initialBalance = await rewards.getCurrentPoolBalance()
      let expectedPoolBalance = initialBalance.plus(rewardsFee)

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      let balance = await rewards.getCurrentPoolBalance()
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the total cryptodollar supply by 99% of payment value', async () => {
      let initialSupply, supply, expectedIncrement, increment, paymentValue

      initialSupply = await cryptoDollar.totalSupply()
      paymentValue = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee - oraclizeFee)
      expectedIncrement = paymentValue.times(exchangeRate.number).div(ether)
      expectedIncrement = Math.floor(expectedIncrement.toNumber())

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      supply = await cryptoDollar.totalSupply()
      increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer cryptoDollar token balance by 99% of payment value', async () => {
      let initialBalance, balance, expectedIncrement, increment, paymentValue

      initialBalance = await cryptoDollar.balanceOf(wallet1)
      paymentValue = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee - oraclizeFee)
      expectedIncrement = paymentValue.times(exchangeRate.number).div(ether)
      expectedIncrement = Math.floor(expectedIncrement.toNumber())

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      balance = await cryptoDollar.balanceOf(wallet1)
      increment = balance.minus(initialBalance)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer reserved ether balance by 99% of payment value', async () => {
      let initialReservedEther, reservedEther, expectedIncrement, increment

      initialReservedEther = await cryptoDollar.reservedEther(wallet1)
      expectedIncrement = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee - oraclizeFee)

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      reservedEther = await cryptoDollar.reservedEther(wallet1)
      increment = reservedEther.minus(initialReservedEther)
      increment.should.be.bignumber.equal(expectedIncrement)
    })
  })

  describe('Selling Cryptodollar tokens', async() => {
    let tokens = 10000 //(= 100 dollars)

    beforeEach(async () => {
      // buy and sell scrap queries to remove free oraclize computationd
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      var { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })
    })

    it('should be able to sell CryptoDollar tokens', async() => {
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder).should.be.fulfilled
    })

    it('should decrease the total supply of cryptodollars', async() => {
      let initialSupply = await cryptoDollar.totalSupply()

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      let supply = await cryptoDollar.totalSupply()
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should decrease the cryptodollar balance', async() => {
      let initialSupply = await cryptoDollar.balanceOf(wallet1)

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      let supply = await cryptoDollar.balanceOf(wallet1)
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should correctly increase the seller account ether balance', async() => {

      let initialBalance = web3.eth.getBalance(wallet1)

      // sell tokens and simulate oraclize callback
      let txn = await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let txFee = defaultSellOrder.gasPrice * txn.receipt.gasUsed
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      // check that callback parameters correspond to initial query
      let tokenAmount = await cryptoFiatHub.callingValue(queryId)
      let sender = await cryptoFiatHub.callingAddress(queryId)
      let oraclizeFee = await cryptoFiatHub.callingFee(queryId)
      tokenAmount.should.be.bignumber.equal(tokens)
      sender.should.be.equal(wallet1)
      oraclizeFee.should.be.bignumber.equal(oraclizeFee) // should be equal to 0 only in testing mode

      // verify account ether balance
      let balance = web3.eth.getBalance(wallet1)
      let payment = tokens * (ether) / exchangeRate.number - oraclizeFee
      let expectedIncrement = payment - txFee
      let increment = balance.minus(initialBalance)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should correctly decrease the seller reserved ether balance', async () => {
      let initialReservedEther, reservedEther, initialTokenBalance
      let variation, expectedVariation

      initialReservedEther = await cryptoDollar.reservedEther(wallet1)
      initialTokenBalance = await cryptoDollar.balanceOf(wallet1)

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })

      // check that callback parameters correspond to initial query
      let callingValue = await cryptoFiatHub.callingValue(queryId)
      let callingAddress = await cryptoFiatHub.callingAddress(queryId)
      let callingFee = await cryptoFiatHub.callingFee(queryId)
      callingValue.should.be.bignumber.equal(tokens)
      callingAddress.should.be.equal(wallet1)
      callingFee.should.be.bignumber.equal(oraclizeFee)

      //  verify account reserved ether
      expectedVariation = initialReservedEther.mul(tokens).div(initialTokenBalance).negated()
      reservedEther = await cryptoDollar.reservedEther(wallet1)
      variation = reservedEther.minus(initialReservedEther)
      variation.minus(expectedVariation).should.be.bignumber.lessThan(1) // rounded value should be equal
    })
  })

  describe('Proxy CryptoDollar State and Balances', async() => {

    before(async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.string, { from: oraclize })
    })

    it('should correctly proxy the cryptoDollar holder balance', async() => {
      let proxyBalance = await cryptoFiatHub.cryptoDollarBalance(wallet1)
      let balance = await cryptoDollar.balanceOf(wallet1)
      proxyBalance.should.be.bignumber.equal(balance)
    })

    it('should proxy the cryptoDollar total supply', async() => {
      let proxySupply = await cryptoFiatHub.cryptoDollarTotalSupply()
      let supply = await cryptoDollar.totalSupply()
      proxySupply.should.be.bignumber.equal(supply)
    })

    it('should return correct total outstanding value', async() => {
      let supply, totalOutstanding, expectedTotalOutstanding

      supply = await cryptoDollar.totalSupply()
      totalOutstanding = await cryptoFiatHub.totalOutstanding(exchangeRate.number)
      expectedTotalOutstanding = supply.times(ether).div(exchangeRate.number)
      expectedTotalOutstanding.should.be.bignumber.equal(totalOutstanding)
    })

    it('should return correct buffer value', async() => {
      let contractBalance = web3.eth.getBalance(CryptoFiatHub.address)
      let totalOutstanding = await cryptoFiatHub.totalOutstanding(exchangeRate.number)
      let buffer = await cryptoFiatHub.buffer(exchangeRate.number)
      let expectedBuffer = contractBalance - totalOutstanding
      expectedBuffer.should.be.bignumber.equal(buffer)
    })
  })
})
