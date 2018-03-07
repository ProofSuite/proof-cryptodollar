/* global  artifacts:true, web3: true, contract: true */
import chai from 'chai'
import chaiStats from 'chai-stats'
import { ipfs } from '../config'
import { ether } from '../scripts/constants'
import { watchNextEvent } from '../scripts/events'

chai.use(require('chai-bignumber')(web3.BigNumber))
.use(chaiStats)
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

contract('Oraclize', async(accounts) => {
  let sender = accounts[0]
  let store, proofToken, cryptoDollar, rewards, cryptoFiatHub
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath

  let IPFSHash = ipfs.TESTING_SUCCESS
  let oraclizeFee = 5385000000000000
  let collateral = 1 * ether
  let defaultGasPrice = 10 * 10 ** 9
  let defaultOrder = { from: sender, value: 1 * ether, gasPrice: defaultGasPrice }
  let defaultSellOrder = { from: sender, gasPrice: defaultGasPrice }
  let expectedExchangeRate = '87537'
  let totalTokens

  /**
  * In this series of tests, we use the testing archive that sends back a static value
  * All the different functions are tested with a mock CryptoFiatHub contract.
  */
  describe.skip('Oraclize Buying CryptoDollars ', async() => {
    before(async() => {
      rewardsStorageProxy = await RewardsStorageProxy.new()
      cryptoFiatStorageProxy = await CryptoFiatStorageProxy.new()
      cryptoDollarStorageProxy = await CryptoDollarStorageProxy.new()
      safeMath = await SafeMath.new()

      // Linking libraries
      await ProofToken.link(SafeMath, safeMath.address)
      await CryptoDollar.link(CryptoDollarStorageProxy, cryptoDollarStorageProxy.address)
      await CryptoDollar.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await CryptoDollar.link(SafeMath, safeMath.address)
      await CryptoFiatHub.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await CryptoFiatHub.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await CryptoFiatHub.link(SafeMath, safeMath.address)
      await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await Rewards.link(SafeMath, safeMath.address)

      // Deploy CryptoFiat Contracts
      store = await Store.new()
      proofToken = await ProofToken.new()
      cryptoDollar = await CryptoDollar.new(store.address)
      rewards = await Rewards.new(store.address, proofToken.address)
      cryptoFiatHub = await CryptoFiatHub.new(cryptoDollar.address, store.address, proofToken.address, rewards.address)

      // CryptoFiat Contract Network Setup

      await store.authorizeAccess(cryptoFiatHub.address)
      await store.authorizeAccess(cryptoDollar.address)
      await store.authorizeAccess(rewards.address)
      await cryptoDollar.authorizeAccess(cryptoFiatHub.address)
      await cryptoFiatHub.initialize(20)
      await cryptoFiatHub.initializeOraclize(IPFSHash, true)
    })

    it('should sucessfully call buyCryptoDollar and call correct callback (first free oraclize query)', async() => {
      let txn = await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let blockNumber = txn.receipt.blockNumber

      let event1 = await watchNextEvent(cryptoFiatHub)
      event1.oraclizeFee.should.be.bignumber.equal(oraclizeFee)

      await new Promise(resolve => setTimeout(resolve, 120000))

      let event2 = await watchNextEvent(cryptoFiatHub, blockNumber + 1)
      event2.queryId.should.be.equal(event1.queryId)
      event2.result.should.be.equal(expectedExchangeRate)
      event2.sender.should.be.equal(sender)

      event2.tokenAmount.should.be.bignumber.equal(86190)

      let expectedPaymentValue = 0.99 * event1.value - event1.oraclizeFee
      event2.paymentValue.should.be.bignumber.equal(expectedPaymentValue)

      let contractBalance = web3.eth.getBalance(cryptoFiatHub.address)
      contractBalance.should.be.bignumber.equal(0.995 * 10 ** 18)
    })

    it('should successfully call buyCryptoDollar and call correct callback (non free oraclize query)', async() => {
      let txn = await cryptoFiatHub.buyCryptoDollar(defaultOrder)
      let blockNumber = txn.receipt.blockNumber

      let event1 = await watchNextEvent(cryptoFiatHub)
      event1.oraclizeFee.should.be.bignumber.equal(oraclizeFee)

      await new Promise(resolve => setTimeout(resolve, 120000))

      let event2 = await watchNextEvent(cryptoFiatHub, blockNumber + 1)
      event2.queryId.should.be.equal(event1.queryId)
      event2.result.should.be.equal(expectedExchangeRate)
      event2.sender.should.be.equal(sender)
      event2.tokenAmount.should.be.bignumber.equal(86190)

      let expectedPaymentValue = 0.99 * event1.value - event1.oraclizeFee
      event2.paymentValue.should.be.bignumber.equal(expectedPaymentValue)

      let contractBalance = web3.eth.getBalance(cryptoFiatHub.address)
      let expectedBalance = 2 * 0.995 * 10 ** 18 - oraclizeFee
      contractBalance.should.be.bignumber.equal(expectedBalance)
    })
  })

  describe.skip('Oraclize Selling CryptoDollars ', async() => {
    before(async() => {
      rewardsStorageProxy = await RewardsStorageProxy.new()
      cryptoFiatStorageProxy = await CryptoFiatStorageProxy.new()
      cryptoDollarStorageProxy = await CryptoDollarStorageProxy.new()
      safeMath = await SafeMath.new()

      // Linking libraries
      await ProofToken.link(SafeMath, safeMath.address)
      await CryptoDollar.link(CryptoDollarStorageProxy, cryptoDollarStorageProxy.address)
      await CryptoDollar.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await CryptoDollar.link(SafeMath, safeMath.address)
      await CryptoFiatHub.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await CryptoFiatHub.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await CryptoFiatHub.link(SafeMath, safeMath.address)
      await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await Rewards.link(SafeMath, safeMath.address)

      // Deploy CryptoFiat Contracts
      store = await Store.new()
      proofToken = await ProofToken.new()
      cryptoDollar = await CryptoDollar.new(store.address)
      rewards = await Rewards.new(store.address, proofToken.address)
      cryptoFiatHub = await CryptoFiatHub.new(cryptoDollar.address, store.address, proofToken.address, rewards.address)

      // CryptoFiat Contract Network Setup
      await store.authorizeAccess(cryptoFiatHub.address)
      await store.authorizeAccess(cryptoDollar.address)
      await store.authorizeAccess(rewards.address)
      await store.authorizeAccess(cryptoDollarStorageProxy.address)
      await cryptoDollar.authorizeAccess(cryptoFiatHub.address)
      await cryptoFiatHub.initialize(20)
      await cryptoFiatHub.initializeOraclize(IPFSHash, true)

      // We initialize the storage contract with initial CryptoDollar balance for the sender
      await cryptoFiatHub.capitalize({ value: collateral })
      await cryptoDollarStorageProxy.incrementBalance(store.address, sender, 10000)
      await cryptoDollarStorageProxy.incrementTotalSupply(store.address, 10000)
      await cryptoDollarStorageProxy.incrementReservedEther(store.address, sender, 1)
    })

    it('should successfully call sellCryptoDollar and call the correct callback', async() => {
      let tokenAmount = 5000
      // Currently the person selling cryptoDollar tokens needs to also send the oraclize fee
      let txn = await cryptoFiatHub.sellCryptoDollar(tokenAmount, { value: oraclizeFee, from: sender })
      let blockNumber = txn.receipt.blockNumber

      // Check that event parameters correspond to caller, function input and oraclize fee
      let event1 = await watchNextEvent(cryptoFiatHub, blockNumber)
      event1.sender.should.be.equal(sender)
      event1.tokenAmount.should.be.equal(tokenAmount)
      event1.oraclizeFee.should.be.bignumber.equal(0)

      // Wait for callback and retrieve the callback event
      await new Promise(resolve => setTimeout(resolve, 120000))
      let event2 = await watchNextEvent(cryptoFiatHub, blockNumber + 1)

      // Check that query parameters correspond to function arguments and exchange rate
      event2.queryId.should.be.equal(event1.queryId)
      event2.result.should.be.equal('87537')
      event2.sender.should.be.equal(sender)
      event2.tokenAmount.should.be.bignumber.equal(tokenAmount)

      // TODO Modify event watcher such that events are automatically encoded to correct type
      let exchangeRate = Number(event2.result)
      let tokenValue = event1.tokenAmount * ether / exchangeRate
      let expectedPaymentValue = tokenValue - event1.oraclizeFee
      event2.paymentValue.should.be.equal(expectedPaymentValue)

      let contractBalance = web3.eth.getBalance(cryptoFiatHub.address)
      let expectedBalance = collateral + oraclizeFee - expectedPaymentValue // first oraclize query is free
      contractBalance.toNumber().should.be.equal(expectedBalance)
    })
  })

  describe.skip('Oraclize Selling Unpegged CryptoDollars ', async() => {
    before(async() => {
      rewardsStorageProxy = await RewardsStorageProxy.new()
      cryptoFiatStorageProxy = await CryptoFiatStorageProxy.new()
      cryptoDollarStorageProxy = await CryptoDollarStorageProxy.new()
      safeMath = await SafeMath.new()

      // Linking libraries
      await ProofToken.link(SafeMath, safeMath.address)
      await CryptoDollar.link(CryptoDollarStorageProxy, cryptoDollarStorageProxy.address)
      await CryptoDollar.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await CryptoDollar.link(SafeMath, safeMath.address)
      await CryptoFiatHub.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await CryptoFiatHub.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await CryptoFiatHub.link(SafeMath, safeMath.address)
      await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await Rewards.link(SafeMath, safeMath.address)

      // Deploy CryptoFiat Contracts
      store = await Store.new()
      proofToken = await ProofToken.new()
      cryptoDollar = await CryptoDollar.new(store.address)
      rewards = await Rewards.new(store.address, proofToken.address)
      cryptoFiatHub = await CryptoFiatHub.new(cryptoDollar.address, store.address, proofToken.address, rewards.address)

      // CryptoFiat Contract Network Setup
      await store.authorizeAccess(cryptoFiatHub.address)
      await store.authorizeAccess(cryptoDollar.address)
      await store.authorizeAccess(rewards.address)
      await store.authorizeAccess(cryptoDollarStorageProxy.address)
      await cryptoDollar.authorizeAccess(cryptoFiatHub.address)
      await cryptoFiatHub.initialize(20)
      await cryptoFiatHub.initializeOraclize(IPFSHash, true)

      // We initialize the storage contract with initial CryptoDollar balance for the sender
      totalTokens = 100000
      await cryptoFiatHub.capitalize({ value: collateral })
      await cryptoDollarStorageProxy.incrementBalance(store.address, sender, totalTokens)
      await cryptoDollarStorageProxy.incrementTotalSupply(store.address, totalTokens)
      await cryptoDollarStorageProxy.incrementReservedEther(store.address, sender, 1 * ether)
    })

    it('should successfully call sellCryptoDollar and call the correct callback', async() => {
      // Currently the person selling cryptoDollar tokens needs to also send the oraclize fee
      // In this test, the caller sells all his tokens
      let tokenAmount = totalTokens
      let reservedEther = 1 * ether
      let txn = await cryptoFiatHub.sellUnpeggedCryptoDollar(tokenAmount, { value: oraclizeFee })
      let blockNumber = txn.receipt.blockNumber

      // check that event parameters correspond to caller, function input and oraclize fee
      let event1 = await watchNextEvent(cryptoFiatHub, blockNumber)
      event1.oraclizeFee.should.be.bignumber.equal(0)
      event1.sender.should.be.equal(sender)
      event1.tokenAmount.should.be.bignumber.equal(tokenAmount)

      // Wait for callback from oraclize and retrieve the callback event
      await new Promise(resolve => setTimeout(resolve, 120000))
      let event2 = await watchNextEvent(cryptoFiatHub, blockNumber + 1)

      // Check that query parameters correspond to function arguments and exchange rate
      event2.queryId.should.be.equal(event1.queryId)
      event2.result.should.be.equal('87537')
      event2.sender.should.be.equal(sender)
      event2.tokenAmount.should.be.bignumber.equal(tokenAmount)

      let expectedPaymentValue = reservedEther - event1.oraclizeFee
      event2.paymentValue.should.be.equal(expectedPaymentValue)

      let contractBalance = web3.eth.getBalance(cryptoFiatHub.address)
      let expectedBalance = collateral + oraclizeFee - expectedPaymentValue
      contractBalance.toNumber().should.be.equal(expectedBalance)
    })
  })
})

  // describe('Oraclize returns a 0-value ', async() => {
  //   before(async() => {
  //     rewardsStorageProxy = await RewardsStorageProxy.new()
  //     cryptoFiatStorageProxy = await CryptoFiatStorageProxy.new()
  //     cryptoDollarStorageProxy = await CryptoDollarStorageProxy.new()
  //     safeMath = await SafeMath.new()

  //     // Linking libraries
  //     await ProofToken.link(SafeMath, safeMath.address)
  //     await CryptoDollar.link(CryptoDollarStorageProxy, cryptoDollarStorageProxy.address)
  //     await CryptoDollar.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
  //     await CryptoDollar.link(SafeMath, safeMath.address)
  //     await CryptoFiatHub.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
  //     await CryptoFiatHub.link(RewardsStorageProxy, rewardsStorageProxy.address)
  //     await CryptoFiatHub.link(SafeMath, safeMath.address)
  //     await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
  //     await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
  //     await Rewards.link(SafeMath, safeMath.address)

  //     // Deploy CryptoFiat Contracts
  //     store = await Store.new()
  //     proofToken = await ProofToken.new()
  //     cryptoDollar = await CryptoDollar.new(store.address)
  //     rewards = await Rewards.new(store.address, proofToken.address)
  //     cryptoFiatHub = await CryptoFiatHub.new(cryptoDollar.address, store.address, proofToken.address, rewards.address)

  //     // CryptoFiat Contract Network Setup
  //     await store.authorizeAccess(cryptoFiatHub.address)
  //     await store.authorizeAccess(cryptoDollar.address)
  //     await store.authorizeAccess(rewards.address)
  //     await store.authorizeAccess(cryptoDollarStorageProxy.address)
  //     await cryptoDollar.authorizeAccess(cryptoFiatHub.address)
  //     await cryptoFiatHub.initialize(20)
  //     await cryptoFiatHub.initializeOraclize(ipfs.TESTING_FAIL, true)

  //     //We initialize the storage contract with initial CryptoDollar balance for the sender
  //     totalTokens = 100000
  //     await cryptoFiatHub.capitalize({ value: collateral })
  //     await cryptoDollarStorageProxy.incrementBalance(store.address, sender, totalTokens)
  //     await cryptoDollarStorageProxy.incrementTotalSupply(store.address, totalTokens)
  //     await cryptoDollarStorageProxy.incrementReservedEther(store.address, sender, 1 * ether)
  //   })

  //   it('should successfully call the sell cryptodollar callback ', async() => {
  //     // Currently the person selling cryptoDollar tokens needs to also send the oraclize fee
  //     // In this test, the caller sells all his tokens

  //     let tokenAmount = totalTokens
  //     let reservedEther = 1 * ether
  //     let txn = await cryptoFiatHub.sellUnpeggedCryptoDollar(tokenAmount, { value: oraclizeFee })
  //     let blockNumber = txn.receipt.blockNumber

  //     watchContract(cryptoFiatHub, blockNumber)

  //     // check that event parameters correspond to caller, function input and oraclize fee
  //     let event1 = await watchNextEvent(cryptoFiatHub, blockNumber)
  //     event1.oraclizeFee.should.be.bignumber.equal(oraclizeFee)
  //     event1.sender.should.be.equal(accounts[0])
  //     event1.tokenAmount.should.be.bignumber.equal(tokenAmount)

  //     // wait for callback from oraclize and retrieve the callback event
  //     await new Promise(resolve => setTimeout(resolve, 120000))
  //     let event2 = await watchNextEvent(cryptoFiatHub, blockNumber + 1)

  //     // check that query parameters correspond to function arguments and exchange rate
  //     event2.queryId.should.be.equal(event1.queryId)
  //     event2.result.should.be.equal('87537')
  //     event2.sender.should.be.equal(sender)
  //     event2.tokenAmount.should.be.bignumber.equal(tokenAmount)

  //     let expectedPaymentValue = reservedEther - event1.oraclizeFee
  //     event2.paymentValue.should.be.equal(expectedPaymentValue)

  //     let contractBalance = web3.eth.getBalance(cryptoFiatHub.address)
  //     let expectedBalance = collateral  + oraclizeFee - expectedPaymentValue
  //     contractBalance.toNumber().should.be.equal(expectedBalance)
  //   })
  // })

