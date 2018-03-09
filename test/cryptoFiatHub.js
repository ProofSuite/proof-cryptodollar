/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../scripts/constants'
import { getWeiBalance, expectRevert } from '../scripts/helpers'
import { watchNextEvent } from '../scripts/events'


chai.use(chaiAsPromised).use(require('chai-bignumber')(web3.BigNumber)).should()

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

contract('Cryptofiat Hub', accounts => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub
  let wallet = accounts[1]
  let wallet2 = accounts[2]
  let oraclize = accounts[3]
  let exchangeRate = { asString: '100000', asNumber: 100000 }
  let payment = 1 * ether
  let bufferFee = 0.005 * payment
  let rewardsFee = 0.005 * payment
  let defaultGasPrice = 10 * 10 ** 9
  let defaultParams = { from: wallet }
  let defaultOrder = { from: wallet, value: 1 * ether, gasPrice: defaultGasPrice }
  let defaultSellOrder = { from: wallet, gasPrice: defaultGasPrice }
  let oraclizeFee = 5385000000000000

  /**
   * The following tests are an attempt at correctly modeling the behavior of the CryptoFiatHub smart-contract.
   * When calling functions such as buyCryptoDollar or sellCryptoDollar, the oraclize call is skipped. The
   * oraclize callback is then replaced by a call to the __callback function from an arbitrary function
   */
  beforeEach(async () => {
    // Libraries are deployed before the rest of the contracts. In the testing case, we need a clean deployment
    // state for each test so we redeploy all libraries an other contracts every time.
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
      cryptoDollar.authorizeAccess(cryptoFiatHub.address),
    ])

    await cryptoFiatHub.initialize(20)
  })

  describe('State variables', async () => {
    it('should set the initial blocknumber', async () => {
      let blockNumber = await cryptoFiatStorageProxy.getCreationBlockNumber(store.address)
      blockNumber.should.be.not.equal(0)
    })

    it('should set the Proof Token reference', async () => {
      let address = await cryptoFiatHub.proofToken.call()
      address.should.not.equal(0x0)
    })

    it('should set the CryptoDollar Token reference', async () => {
      let address = await cryptoFiatHub.cryptoDollar.call()
      address.should.not.equal(0x0)
    })

    it('should set the Store reference', async () => {
      let address = await cryptoFiatHub.store.call()
      address.should.not.equal(0x0)
    })
  })

  describe('Buying Tokens', async () => {
    it('should be able to buy CryptoDollar tokens', async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder).should.be.fulfilled
    })

    it('should increase the rewards contract balance by 0.5% of investment value', async () => {
      let initialBalance = await getWeiBalance(rewards.address)
      let expectedPoolBalance = initialBalance + rewardsFee

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString)

      let balance = await getWeiBalance(rewards.address)
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the rewards current pool balance by 0.5% of investment value', async () => {
      let initialBalance = await rewards.getCurrentPoolBalance()
      let expectedPoolBalance = initialBalance.plus(rewardsFee)

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      let balance = await rewards.getCurrentPoolBalance()
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the total cryptodollar supply by 99% of payment value', async () => {
      let initialSupply, supply, expectedIncrement, increment, paymentValue

      initialSupply = await cryptoDollar.totalSupply()
      paymentValue = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee - oraclizeFee)
      expectedIncrement = paymentValue.times(exchangeRate.asNumber).div(ether)
      expectedIncrement = Math.floor(expectedIncrement.toNumber())

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      supply = await cryptoDollar.totalSupply()
      increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer cryptoDollar token balance by 99% of payment value', async () => {
      let initialBalance, balance, expectedIncrement, increment, paymentValue
      initialBalance = await cryptoDollar.balanceOf(wallet)
      paymentValue = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee - oraclizeFee)
      expectedIncrement = paymentValue.times(exchangeRate.asNumber).div(ether)
      expectedIncrement = Math.floor(expectedIncrement.toNumber())

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      balance = await cryptoDollar.balanceOf(wallet)
      increment = balance.minus(initialBalance)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer reserved ether balance by 99% of payment value', async () => {
      let initialReservedEther, reservedEther, expectedIncrement, increment
      initialReservedEther = await cryptoDollar.reservedEther(wallet)
      expectedIncrement = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee - oraclizeFee)

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      reservedEther = await cryptoDollar.reservedEther(wallet)
      increment = reservedEther.minus(initialReservedEther)
      increment.should.be.bignumber.equal(expectedIncrement)
    })
  })

  describe('Selling Cryptodollar tokens', async () => {
    let tokens = 10000 // (= 100 dollars)

    beforeEach(async () => {
      // buy and sell scrap queries to remove free oraclize computationd
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      var { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })
    })

    it('should be able to sell CryptoDollar tokens', async () => {
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder).should.be.fulfilled
    })

    it('should decrease the total supply of cryptodollars', async () => {
      let initialSupply = await cryptoDollar.totalSupply()

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      let supply = await cryptoDollar.totalSupply()
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should decrease the cryptodollar balance', async () => {
      let initialSupply = await cryptoDollar.balanceOf(wallet)

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      let supply = await cryptoDollar.balanceOf(wallet)
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should correctly increase the seller account ether balance', async () => {
      let initialBalance = web3.eth.getBalance(wallet)

      // sell tokens and simulate oraclize callback
      let txn = await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let txFee = defaultSellOrder.gasPrice * txn.receipt.gasUsed
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      // check that callback parameters correspond to initial query
      let queryParameters = [
        cryptoFiatHub.callingValue(queryId),
        cryptoFiatHub.callingAddress(queryId),
        cryptoFiatHub.callingFee(queryId)
      ]

      let [ callingValue, callingAddress, callingFee ] = await Promise.all(queryParameters)
      callingValue.should.be.bignumber.equal(tokens)
      callingAddress.should.be.equal(wallet)
      callingFee.should.be.bignumber.equal(oraclizeFee) // should be equal to 0 only in testing mode

      // verify account ether balance
      let balance = web3.eth.getBalance(wallet)
      let payment = tokens * ether / exchangeRate.asNumber - oraclizeFee
      let expectedIncrement = payment - txFee
      let increment = balance.minus(initialBalance)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should correctly decrease the seller reserved ether balance', async () => {
      let initialReservedEther, reservedEther, initialTokenBalance
      let variation, expectedVariation

      initialReservedEther = await cryptoDollar.reservedEther(wallet)
      initialTokenBalance = await cryptoDollar.balanceOf(wallet)

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })

      // check that callback parameters correspond to initial query
      let queryParameters = [
        cryptoFiatHub.callingValue(queryId),
        cryptoFiatHub.callingAddress(queryId),
        cryptoFiatHub.callingFee(queryId)
      ]

      let [ callingValue, callingAddress, callingFee ] = await Promise.all(queryParameters)
      callingValue.should.be.bignumber.equal(tokens)
      callingAddress.should.be.equal(wallet)
      callingFee.should.be.bignumber.equal(oraclizeFee)

      //  verify account reserved ether
      expectedVariation = initialReservedEther.mul(tokens).div(initialTokenBalance).negated()
      reservedEther = await cryptoDollar.reservedEther(wallet)
      variation = reservedEther.minus(initialReservedEther)
      variation.minus(expectedVariation).should.be.bignumber.lessThan(1) // rounded value should be equal
    })

    it('should fail if selling amount of tokens above balance', async () => {
      let tokenBalance = await cryptoFiatHub.cryptoDollarBalance(wallet)
      let tokenAmount = tokenBalance.plus(1)
      await expectRevert(cryptoFiatHub.sellCryptoDollar(tokenAmount, defaultSellOrder))
    })

    it('should not allow user to double spend cryptodollar tokens', async() => {
      let initialTokenBalance = await cryptoDollar.balanceOf(wallet)

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(initialTokenBalance, defaultSellOrder)
      let { queryId: queryId1 } = await watchNextEvent(cryptoFiatHub)

      await cryptoFiatHub.sellCryptoDollar(initialTokenBalance, defaultSellOrder)
      let { queryId: queryId2 } = await watchNextEvent(cryptoFiatHub)

      await cryptoFiatHub.__callback(queryId1, exchangeRate.asString, { from: oraclize })
      await expectRevert(cryptoFiatHub.__callback(queryId2, exchangeRate.asString, { from: oraclize }))

      let tokenBalance = await cryptoDollar.balanceOf(wallet)
      let decrement = tokenBalance.minus(initialTokenBalance)
      decrement.should.be.bignumber.equal(-initialTokenBalance)
    })

    it('should not allow user to double spend cryptodollar tokens (unordered oraclize callback)', async() => {
      let initialTokenBalance = await cryptoDollar.balanceOf(wallet)

      await cryptoFiatHub.sellCryptoDollar(initialTokenBalance, defaultSellOrder)
      let { queryId: queryId1 } = await watchNextEvent(cryptoFiatHub)

      await cryptoFiatHub.sellCryptoDollar(initialTokenBalance, defaultSellOrder)
      let { queryId: queryId2 } = await watchNextEvent(cryptoFiatHub)

      await cryptoFiatHub.__callback(queryId2, exchangeRate.asString, { from: oraclize })
      await expectRevert(cryptoFiatHub.__callback(queryId1, exchangeRate.asString, { from: oraclize }))

      let tokenBalance = await cryptoDollar.balanceOf(wallet)
      let decrement = tokenBalance.minus(initialTokenBalance)
      decrement.should.be.bignumber.equal(-initialTokenBalance)
    })
  })

  describe('Proxy CryptoDollar State and Balances', async () => {
    beforeEach(async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize })
    })

    it('should correctly proxy the cryptoDollar holder balance', async () => {
      let proxyBalance = await cryptoFiatHub.cryptoDollarBalance(wallet)
      let balance = await cryptoDollar.balanceOf(wallet)
      proxyBalance.should.be.bignumber.equal(balance)
    })

    it('should proxy the cryptoDollar total supply', async () => {
      let proxySupply = await cryptoFiatHub.cryptoDollarTotalSupply()
      let supply = await cryptoDollar.totalSupply()
      proxySupply.should.be.bignumber.equal(supply)
    })

    it('should return correct total outstanding value', async () => {
      let supply, totalOutstanding, expectedTotalOutstanding
      supply = await cryptoDollar.totalSupply()
      totalOutstanding = await cryptoFiatHub.totalOutstanding(exchangeRate.asNumber)
      expectedTotalOutstanding = supply.times(ether).div(exchangeRate.asNumber)
      expectedTotalOutstanding.should.be.bignumber.equal(totalOutstanding)
    })

    it.only('should return correct buffer value', async () => {
      let contractBalance = await cryptoFiatHub.contractBalance()
      let totalOutstanding = await cryptoFiatHub.totalOutstanding(exchangeRate.asNumber)
      let buffer = await cryptoFiatHub.buffer(exchangeRate.asNumber)
      let expectedBuffer = contractBalance - totalOutstanding
      buffer.should.be.bignumber.equal(expectedBuffer)
    })
  })

  describe('Withdrawing funds before oraclize callback', async() => {
    it('should be able to withdraw ether before oraclize callback', async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let { queryId } = await watchNextEvent(cryptoFiatHub)
      let initialEtherBalance = web3.eth.getBalance(defaultOrder.from)

      let queryParameters = await Promise.all([
        cryptoFiatHub.callingValue(queryId),
        cryptoFiatHub.callingFee(queryId)])
      let [ callingValue, callingFee ] = queryParameters

      let txParams = { from: defaultOrder.from, gasPrice: defaultGasPrice }
      let tx = await cryptoFiatHub.withdrawEther(queryId, txParams)
      let txFee = txParams.gasPrice * tx.receipt.gasUsed
      let expectedIncrement = callingValue - callingFee - callingValue * (0.005) - txFee

      let etherBalance = web3.eth.getBalance(defaultOrder.from)
      let increment = etherBalance.minus(initialEtherBalance)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should not be able to sell ether tokens after withdrawing ether', async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let { queryId } = await watchNextEvent(cryptoFiatHub)
      let txParams = { from: defaultOrder.from, gasPrice: defaultGasPrice }
      await cryptoFiatHub.withdrawEther(queryId, txParams)

      let balanceAfterWithdraw = web3.eth.getBalance(defaultOrder.from)
      await expectRevert(cryptoFiatHub.__callback(queryId, exchangeRate.asString, { from: oraclize }))
      let balanceAfterCallback = web3.eth.getBalance(defaultOrder.from)
      balanceAfterCallback.should.be.bignumber.equal(balanceAfterWithdraw)
    })

    it('should fail if the person attempting to withdraw did not make the query', async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      let txParams = { from: wallet2 }

      await expectRevert(cryptoFiatHub.withdrawEther(queryId, txParams))
    })

    it('should fail if the query does not correspond to buying cryptoDollars', async () => {
      let tokens = 1000

      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let { queryId: queryId1 } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId1, exchangeRate.asString, { from: oraclize })

      await cryptoFiatHub.sellCryptoDollar(tokens, defaultOrder)
      let { queryId: queryId2 } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId2, exchangeRate.asString, { from: oraclize })

      let txParams = { from: defaultOrder.from, gasPrice: defaultGasPrice }
      await expectRevert(cryptoFiatHub.withdrawEther(queryId2, txParams))
    })
  })
})
