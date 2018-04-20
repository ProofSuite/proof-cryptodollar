/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../../../scripts/constants'
import { getWeiBalance, expectRevert } from '../../../scripts/helpers'

chai.use(chaiAsPromised).use(require('chai-bignumber')(web3.BigNumber)).should()

const should = chai.should()
const RewardsStorageProxy = artifacts.require('./libraries/RewardsStorageProxy.sol')
const CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
const CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
const Medianizer = artifacts.require('./mocks/Medianizer.sol')
const SafeMath = artifacts.require('./libraries/SafeMath.sol')
const CryptoDollar = artifacts.require('./CryptoDollar.sol')
const CryptoFiatHub = artifacts.require('./CryptoFiatHub.sol')
const ProofToken = artifacts.require('./mocks/ProofToken.sol')
const Store = artifacts.require('./Store.sol')
const Rewards = artifacts.require('./Rewards.sol')

contract('Cryptofiat Hub (with medianizer price feed setup)', accounts => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath, medianizer
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub
  let wallet = accounts[1]
  let exchangeRate = { asString: '100000', asNumber: 100000 }
  let payment = 1 * ether
  let bufferFee = 0.005 * payment
  let rewardsFee = 0.005 * payment
  let defaultGasPrice = 10 * 10 ** 9
  let defaultOrder = { from: wallet, value: 1 * ether, gasPrice: defaultGasPrice }
  let defaultSellOrder = { from: wallet, gasPrice: defaultGasPrice }

  /**
   * The following tests are an attempt at correctly modeling the behavior of the CryptoFiatHub smart-contract.
   * When calling functions such as buyCryptoDollar or sellCryptoDollar, the oraclize call is skipped. The
   * oraclize callback is then replaced by a call to the __callback function from an arbitrary function
   */
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
    medianizer = await Medianizer.new(exchangeRate.asNumber)

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

    await cryptoFiatHub.initialize(20, '', medianizer.address)
    await cryptoFiatHub.useMedianizer()
  })

  describe('Buying Tokens (with Price Feed setup)', async () => {
    it('should be able to buy CryptoDollar tokens', async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder).should.be.fulfilled
    })

    it('should increase the rewards contract balance by 0.5% of investment value', async () => {
      let initialBalance = await getWeiBalance(rewards.address)
      let expectedPoolBalance = initialBalance + rewardsFee

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let balance = await getWeiBalance(rewards.address)
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the rewards current pool balance by 0.5% of investment value', async () => {
      let initialBalance = await rewards.getCurrentPoolBalance()
      let expectedPoolBalance = initialBalance.plus(rewardsFee)

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      let balance = await rewards.getCurrentPoolBalance()
      balance.should.be.bignumber.equal(expectedPoolBalance)
    })

    it('should increase the total cryptodollar supply by 99% of payment value', async () => {
      let initialSupply, supply, expectedIncrement, increment, paymentValue

      initialSupply = await cryptoDollar.totalSupply()
      paymentValue = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee)
      expectedIncrement = paymentValue.times(exchangeRate.asNumber).div(ether)
      expectedIncrement = Math.floor(expectedIncrement.toNumber())

      // buy tokens and simulate oraclize callback
      let { receipt } = await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let txnFee = receipt.gasUsed * defaultOrder.gasPrice

      supply = await cryptoDollar.totalSupply()
      increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer cryptoDollar token balance by 99% of payment value', async () => {
      let initialBalance, balance, expectedIncrement, increment, paymentValue
      initialBalance = await cryptoDollar.balanceOf(wallet)
      paymentValue = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee)
      expectedIncrement = paymentValue.times(exchangeRate.asNumber).div(ether)
      expectedIncrement = Math.floor(expectedIncrement.toNumber())

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      balance = await cryptoDollar.balanceOf(wallet)
      increment = balance.minus(initialBalance)
      increment.should.be.bignumber.equal(expectedIncrement)
    })

    it('should increment the buyer reserved ether balance by 99% of payment value', async () => {
      let initialReservedEther, reservedEther, expectedIncrement, increment
      initialReservedEther = await cryptoDollar.reservedEther(wallet)
      expectedIncrement = new web3.BigNumber(defaultOrder.value - rewardsFee - bufferFee)

      // buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)

      reservedEther = await cryptoDollar.reservedEther(wallet)
      increment = reservedEther.minus(initialReservedEther)
      increment.should.be.bignumber.equal(expectedIncrement)
    })
  })

  describe('Proxy CryptoDollar State and Balances', async () => {
    before(async () => {
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
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

    it('should return correct buffer value', async () => {
      let contractBalance = web3.eth.getBalance(CryptoFiatHub.address)
      let totalOutstanding = await cryptoFiatHub.totalOutstanding(exchangeRate.asNumber)
      let buffer = await cryptoFiatHub.buffer(exchangeRate.asNumber)
      let expectedBuffer = contractBalance - totalOutstanding
      expectedBuffer.should.be.bignumber.equal(buffer)
    })
  })
})
