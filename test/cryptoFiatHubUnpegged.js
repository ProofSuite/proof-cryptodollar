/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../scripts/constants'
import { waitUntilTransactionsMined, expectRevert } from '../scripts/helpers'
import { getState } from '../scripts/cryptoFiatHelpers'

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
const PriceFeedMock = artifacts.require('./mocks/PriceFeedMock.sol')
const Store = artifacts.require('./Store.sol')
const Rewards = artifacts.require('./Rewards.sol')

contract('Cryptofiat Hub', (accounts) => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub, priceFeed
  let fund = accounts[0]
  let wallet1 = accounts[1]
  let initialExchangeRate
  let updatedExchangeRate
  let funding
  let payment
  let tokens

  /*
  The initial exchange rate is equal to 1 ETH = 100 USD (in cents, exchangeRate = 10000)
  The contract is initially capitalized with 1 ether
  The first user (wallet1) buys 1000 tokens therefore the contract state is initially:

  buffer = contractbalance - outstanding = 2 ether - ~1000 cryptodollar tokens = 2 ether - 10 ether = 1 ether
  Thus buffer > 0

  The exchange rate drops and is now equal to 1 ETH = 10 USD (in cents, exchangeRate = 100)
  Thus buffer = contractbalance - outstanding = 11 ether - 1000 cryptodollar tokens = 11 ether - 100 ether = - 89 ether
  **/
  describe('Selling unpegged dollars', async () => {
    let txn

    before(async () => {
      // Standard scenario with an initial funding of 1 ether and payment (buy value) of 1 ether.
      funding = 1 * ether
      payment = 1 * ether

      // In this scenario, the initial exchange rate is 1 ETH = 100 USD (exchangeRate = 10000)
      // The updated exchange rate is 1 ETH = 10 USD (exchangeRate 1000)
      // The exchange rate is actually representing ethers to cents
      initialExchangeRate = 20000
      updatedExchangeRate = initialExchangeRate / 10

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
      priceFeed = await PriceFeedMock.new(initialExchangeRate)
      cryptoFiatHub = await CryptoFiatHub.new(cryptoDollar.address, store.address, proofToken.address, rewards.address, priceFeed.address)

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
      await priceFeed.setCryptoFiatHub(cryptoFiatHub.address)
      await cryptoFiatHub.initialize(20)

      let txn = await cryptoFiatHub.capitalize({ from: fund, value: funding })
      await waitUntilTransactionsMined(txn.tx)

      let params = { from: wallet1, value: payment }
      txn = await cryptoFiatHub.buyCryptoDollar(params)
      await waitUntilTransactionsMined(txn.tx)

      txn = await priceFeed.setExchangeRate(updatedExchangeRate)
      await waitUntilTransactionsMined(txn.tx)

      tokens = await cryptoFiatHub.cryptoDollarBalance(wallet1)
      tokens = tokens.toNumber()
    })

    it('should be in an unpegged state', async () => {
      // the state depends both on the state of the cryptodollar/cryptofiat contract and the pricefeed
      let currentState = await getState(cryptoFiatHub, priceFeed)
      currentState.should.be.equal('UNPEGGED')
    })

    it('should throw an invalid opcode when calling the sellCryptoDollar function', async () => {
      await expectRevert(cryptoFiatHub.sellCryptoDollar(1, { from: wallet1, value: 1 * ether }))
    })

    it('should sell unpegged cryptodollar tokens', async () => {
      let accountBalance = web3.eth.getBalance(wallet1)
      let reservedEther = await cryptoDollar.reservedEther(wallet1)
      let oraclizeFee = 0.03 * ether
      let params = { from: wallet1, gasPrice: 10 * 10 ** 9, value: oraclizeFee }

      txn = await cryptoFiatHub.sellUnpeggedCryptoDollar(tokens, params).should.be.fulfilled
      await waitUntilTransactionsMined(txn.tx)
      let sellTxnFee = txn.receipt.gasUsed * params.gasPrice

      let finalAccountBalance = web3.eth.getBalance(wallet1)
      let finalReservedEther = await cryptoDollar.reservedEther(wallet1)

      let reservedEtherVariation = finalReservedEther.minus(reservedEther)
      let accountBalanceVariation = finalAccountBalance.minus(accountBalance)
      let expectedAccountBalanceVariation = reservedEther.minus(sellTxnFee).minus(oraclizeFee)

      accountBalanceVariation.should.be.bignumber.equal(expectedAccountBalanceVariation)
      reservedEtherVariation.should.be.bignumber.equal(-reservedEther)
    })

    it('should update user balance', async () => {
      let tokenBalance = await cryptoFiatHub.cryptoDollarBalance(wallet1)
      tokenBalance.should.be.bignumber.equal(0)
    })

    it('should update the token supply', async () => {
      let tokenSupply = await cryptoFiatHub.cryptoDollarTotalSupply()
      tokenSupply.should.be.bignumber.equal(0)
    })
  })
})
