/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../scripts/constants'
import { expectInvalidOpcode, expectRevert } from '../scripts/helpers'
import { getState } from '../scripts/cryptoFiatHelpers'
import { watchNextEvent } from '../scripts/events'

chai.use(chaiAsPromised)
    .use(require('chai-bignumber')(web3.BigNumber))
    .should()

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
  let initialExchangeRate
  let updatedExchangeRate
  let tokens

  // Standard scenario with an initial collateral of 1 ether and payment (buy value) of 1 ether.
  let collateral = 1 * ether
  let fund = accounts[0]
  let wallet1 = accounts[1]
  let oraclize = accounts[2]
  let oraclizeFee = 5385000000000000
  let defaultGasPrice = 1 * 10 ** 9
  let defaultBuyOrder = { from: wallet1, value: 1 * ether, gasPrice: defaultGasPrice }
  let defaultSellOrder = { from: wallet1, gasPrice: defaultGasPrice }

  /*
  The initial exchange rate is equal to 1 ETH = 100 USD (in cents, exchangeRate = 10000)
  The contract is initially capitalized with 1 ether
  The first user (wallet1) buys 1000 tokens therefore the contract state is initially:

  buffer = contractbalance - outstanding = 2 ether - ~1000 cryptodollar tokens = 2 ether - 10 ether = 1 ether
  Thus buffer > 0

  The exchange rate drops and is now equal to 1 ETH = 10 USD (in cents, exchangeRate = 100)
  Thus buffer = contractbalance - outstanding = 11 ether - 1000 cryptodollar tokens = 11 ether - 100 ether = - 89 ether
  **/
  describe.only('Selling unpegged dollars', async () => {
    before(async () => {
      // In this scenario, the initial exchange rate is 1 ETH = 100 USD (exchangeRate = 10000)
      // The updated exchange rate is 1 ETH = 10 USD (exchangeRate 1000)
      // The exchange rate is actually representing ethers to cents
      // The exchange rates are kept in objects that references them both in strings and numbers since the
      // __callback function takes exchanges rate as a string value
      initialExchangeRate = { asString: '20000', asNumber: 20000 }
      updatedExchangeRate = { asString: '2000', asNumber: 2000 }

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

      await Promise.all([
        cryptoFiatHub.initialize(20),
        cryptoFiatHub.capitalize({ from: fund, value: collateral })
      ])

      //buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultBuyOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, initialExchangeRate.asString)

      tokens = await cryptoFiatHub.cryptoDollarBalance(wallet1)
      tokens = tokens.toNumber()
    })

    it('should be in an unpegged state', async () => {
      // the state depends both on the state of the cryptodollar/cryptofiat contract and the pricefeed
      let currentState = await getState(cryptoFiatHub, updatedExchangeRate.asNumber)
      currentState.should.be.equal('UNPEGGED')
    })

    it('__callback after an calling the (pegged) cryptoDollar function should fail', async () => {
      await cryptoFiatHub.sellCryptoDollar(1, { from: wallet1, value: ether })
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await expectInvalidOpcode(cryptoFiatHub.__callback(queryId, updatedExchangeRate.asNumber))
    })

    it('should sell unpegged cryptodollar tokens', async () => {
      let accountBalance = web3.eth.getBalance(wallet1)
      let reservedEther = await cryptoDollar.reservedEther(wallet1)

      let txn = await cryptoFiatHub.sellUnpeggedCryptoDollar(tokens, defaultSellOrder).should.be.fulfilled
      let txnFee = txn.receipt.gasUsed * defaultSellOrder.gasPrice
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, updatedExchangeRate.asString, { from: oraclize })

      // check that callback parameters correspond to initial query
      let queryParameters = [
        cryptoFiatHub.callingValue(queryId),
        cryptoFiatHub.callingAddress(queryId),
        cryptoFiatHub.callingFee(queryId)
      ]

      let [ callingValue, callingAddress, callingFee ] = await Promise.all(queryParameters)
      callingValue.should.be.bignumber.equal(tokens)
      callingAddress.should.be.equal(wallet1)
      callingFee.should.be.bignumber.equal(oraclizeFee)

      let finalAccountBalance = web3.eth.getBalance(wallet1)
      let finalReservedEther = await cryptoDollar.reservedEther(wallet1)
      let reservedEtherVariation = finalReservedEther.minus(reservedEther)
      let accountBalanceVariation = finalAccountBalance.minus(accountBalance)
      let expectedAccountBalanceVariation = reservedEther.minus(txnFee).minus(oraclizeFee)
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

    it('should fail if selling amount of tokens above balance', async () => {
      let tokenBalance = await cryptoFiatHub.cryptoDollarBalance(wallet1)
      let tokenAmount = tokenBalance.plus(1)
      await expectRevert(cryptoFiatHub.sellUnpeggedCryptoDollar(tokenAmount, defaultSellOrder))
    })
  })

  describe('Selling unpegged dollars (attempt to double-spend)', async () => {
    beforeEach(async () => {
      // In this scenario, the initial exchange rate is 1 ETH = 100 USD (exchangeRate = 10000)
      // The updated exchange rate is 1 ETH = 10 USD (exchangeRate 1000)
      // The exchange rate is actually representing ethers to cents
      // The exchange rates are kept in objects that references them both in strings and numbers since the
      // __callback function takes exchanges rate as a string value
      initialExchangeRate = { asString: '20000', asNumber: 20000 }
      updatedExchangeRate = { asString: '2000', asNumber: 2000 }

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

      await Promise.all([
        cryptoFiatHub.initialize(20),
        cryptoFiatHub.capitalize({ from: fund, value: collateral })
      ])

      //buy tokens and simulate oraclize callback
      await cryptoFiatHub.buyCryptoDollar(defaultBuyOrder)
      let { queryId } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.__callback(queryId, initialExchangeRate.asString)

      tokens = await cryptoFiatHub.cryptoDollarBalance(wallet1)
      tokens = tokens.toNumber()
    })

    it('should not allow user to double spend cryptodollar tokens', async () => {
      let initialTokenBalance = await cryptoDollar.balanceOf(wallet1)

      await cryptoFiatHub.sellUnpeggedCryptoDollar(tokens, defaultSellOrder)
      let { queryId: queryId1 } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.sellUnpeggedCryptoDollar(tokens, defaultSellOrder)
      let { queryId: queryId2 } = await watchNextEvent(cryptoFiatHub)

      await cryptoFiatHub.__callback(queryId1, updatedExchangeRate.asString, { from: oraclize }).should.be.fulfilled
      await expectRevert(cryptoFiatHub.__callback(queryId2, updatedExchangeRate.asString, { from: oraclize }))

      let tokenBalance = await cryptoDollar.balanceOf(wallet1)
      let decrement = tokenBalance.minus(initialTokenBalance)
      decrement.should.be.bignumber.equal(-initialTokenBalance)
    })

    it('should not allow user to double spend cryptodollar tokens (unordered oraclize callback)', async() => {
      let initialTokenBalance = await cryptoDollar.balanceOf(wallet1)

      await cryptoFiatHub.sellUnpeggedCryptoDollar(tokens, defaultSellOrder)
      let { queryId: queryId1 } = await watchNextEvent(cryptoFiatHub)
      await cryptoFiatHub.sellUnpeggedCryptoDollar(tokens, defaultSellOrder)
      let { queryId: queryId2 } = await watchNextEvent(cryptoFiatHub)

      await cryptoFiatHub.__callback(queryId2, updatedExchangeRate.asString, { from: oraclize }).should.be.fulfilled
      await expectRevert(cryptoFiatHub.__callback(queryId1, updatedExchangeRate.asString, { from: oraclize }))

      let tokenBalance = await cryptoDollar.balanceOf(wallet1)
      let decrement = tokenBalance.minus(initialTokenBalance)
      decrement.should.be.bignumber.equal(-initialTokenBalance)
    })
  })
})
