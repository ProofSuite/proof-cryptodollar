/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../../../scripts/constants'
import { expectRevert } from '../../../scripts/helpers'

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

contract('Cryptofiat Hub (with Medianizer Price Feed setup)', accounts => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath, medianizer
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub
  let wallet = accounts[1]
  let exchangeRate = { asString: '100000', asNumber: 100000 }
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

  describe('Selling Cryptodollar tokens (with Price Feed setup)', async () => {
    let tokens = 10000 // (= 100 dollars)

    beforeEach(async () => {
      // buy and sell scrap queries to remove free oraclize computationd
      await cryptoFiatHub.buyCryptoDollar(defaultOrder)
    })

    it('should be able to sell CryptoDollar tokens', async () => {
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder).should.be.fulfilled
    })

    it('should decrease the total supply of cryptodollars', async () => {
      let initialSupply = await cryptoDollar.totalSupply()

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)

      let supply = await cryptoDollar.totalSupply()
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should decrease the cryptodollar balance', async () => {
      let initialSupply = await cryptoDollar.balanceOf(wallet)

      // sell tokens and simulate oraclize callback
      await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)

      let supply = await cryptoDollar.balanceOf(wallet)
      let increment = supply.minus(initialSupply)
      increment.should.be.bignumber.equal(-tokens)
    })

    it('should correctly increase the seller account ether balance', async () => {
      let initialBalance = web3.eth.getBalance(wallet)

      // sell tokens and simulate oraclize callback
      let txn = await cryptoFiatHub.sellCryptoDollar(tokens, defaultSellOrder)
      let txFee = defaultSellOrder.gasPrice * txn.receipt.gasUsed

      // verify account ether balance
      let balance = web3.eth.getBalance(wallet)
      let payment = tokens * ether / exchangeRate.asNumber
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
  })
})
