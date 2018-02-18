/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { getFee, getOrderEtherValue, getOrderWeiValue } from '../scripts/cryptoFiatHelpers'
import { getWeiBalance } from '../scripts/helpers'

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
const Store = artifacts.require("./Store.sol")
const Rewards = artifacts.require("./Rewards.sol")

contract('Cryptofiat Hub', (accounts) => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub
  let wallet1 = accounts[0]

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
    let defaultOrder
    let exchangeRate

    beforeEach(async () => {
      defaultOrder = { from: wallet1, value: 1 * 10 ** 18 }
      exchangeRate = await cryptoFiatHub.exchangeRate.call()
    })

    it('should be able to buy CryptoDollar tokens', async() => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder).should.be.fulfilled
    })

    it('should increase the rewards contract balance by 0.5% of investment value', async () => {
      let initialBalance = await getWeiBalance(rewards.address)
      let fee = getFee(defaultOrder.value, 0.005)
      let expectedPoolBalance = initialBalance + fee

      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let balance = await getWeiBalance(rewards.address)
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the rewards current pool balance by 0.5% of investment value', async () => {
      let initialBalance = await rewards.getCurrentPoolBalance()
      let fee = getFee(defaultOrder.value, 0.005)
      let expectedPoolBalance = initialBalance.plus(fee)

      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let balance = await rewards.getCurrentPoolBalance()
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the total cryptodollar supply by 99% of invested value', async () => {
      let initialSupply = await cryptoDollar.totalSupply()
      let etherValue = await getOrderEtherValue(defaultOrder.value) //get the ether value of the order after fee
      let expectedIncrement = exchangeRate.times(etherValue)

      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let supply = await cryptoDollar.totalSupply()
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer cryptoDollar token balance by 99% of invested value', async () => {
      let initialBalance = await cryptoDollar.balanceOf(wallet1)
      let etherValue = await getOrderEtherValue(defaultOrder.value)
      let expectedIncrement = exchangeRate.times(etherValue)

      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let balance = await cryptoDollar.balanceOf(wallet1)
      let increment = balance.minus(initialBalance)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer reserved ether balance by 99% of invested value', async () => {
      let initialReservedEther = await cryptoDollar.reservedEther(wallet1)
      let expectedIncrement = await getOrderWeiValue(defaultOrder.value)

      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let reservedEther = await cryptoDollar.reservedEther(wallet1)
      let increment = reservedEther.minus(initialReservedEther)
      increment.should.be.bignumber.equal(expectedIncrement)
    })
  })

  describe('Selling Cryptodollar tokens', async() => {
    let params
    let exchangeRate
    let tokens
    let defaultOrder

    beforeEach(async () => {
      defaultOrder = { from: wallet1, value: 1 * 10 ** 18 }
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      params = { from: wallet1, gasPrice: 10 * 10 ** 9 }
      exchangeRate = await cryptoFiatHub.exchangeRate.call()
      tokens = 100
    })

    it('should be able to sell CryptoDollar tokens', async() => {
      await cryptoFiatHub.sellCryptoDollar(tokens, params).should.be.fulfilled
    })

    it('should decrease the total supply of cryptodollars', async() => {
      let initialSupply = await cryptoDollar.totalSupply()

      await cryptoFiatHub.sellCryptoDollar(tokens, params)

      let supply = await cryptoDollar.totalSupply()
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should decrease the cryptodollar balance', async() => {
      let initialSupply = await cryptoDollar.balanceOf(wallet1)

      await cryptoFiatHub.sellCryptoDollar(tokens, params)

      let supply = await cryptoDollar.balanceOf(wallet1)
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should correctly increase the seller account ether balance', async() => {
      let initialBalance = web3.eth.getBalance(wallet1)
      let txn = await cryptoFiatHub.sellCryptoDollar(tokens, params)
      let balance = web3.eth.getBalance(wallet1)
      let txFee = params.gasPrice * txn.receipt.gasUsed
      let payment = web3.toWei(tokens / exchangeRate)

      let expectedIncrement = payment - txFee
      let increment = balance.minus(initialBalance)

      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should correctly decrease the seller reserved ether balance', async () => {
      let initialReservedEther = await cryptoDollar.reservedEther(wallet1)
      let initialTokenBalance = await cryptoDollar.balanceOf(wallet1)

      let txn = await cryptoFiatHub.sellCryptoDollar(tokens, params)
      let reservedEther = await cryptoDollar.reservedEther(wallet1)

      let expectedVariation = initialReservedEther.mul(tokens).div(initialTokenBalance).negated().toNumber()
      let variation = reservedEther.minus(initialReservedEther)

      variation.should.be.bignumber.equal(expectedVariation)
    })
  })

  describe('Proxy CryptoDollar State and Balances', async() => {
    let defaultOrder
    let exchangeRate

    before(async () => {
      defaultOrder = { from: wallet1, value: 1 * 10 ** 18 }

      exchangeRate = await cryptoFiatHub.exchangeRate.call()
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
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
      let supply = await cryptoDollar.totalSupply()
      let totalOutstanding = await cryptoFiatHub.totalOutstanding()
      let expectedTotalOutstanding = supply.times(10 ** 18).div(exchangeRate)

      expectedTotalOutstanding.should.be.bignumber.equal(totalOutstanding)
    })

    it('should return correct buffer value', async() => {
      let contractBalance = web3.eth.getBalance(CryptoFiatHub.address)
      let totalOutstanding = await cryptoFiatHub.totalOutstanding()
      let buffer = await cryptoFiatHub.buffer()
      let expectedBuffer = contractBalance - totalOutstanding

      expectedBuffer.should.be.bignumber.equal(buffer)
    })
  })
})
