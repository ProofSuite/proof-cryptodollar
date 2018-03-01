import chai from 'chai'
import chaiStats from 'chai-stats'
import { ipfs } from '../config'
import { ether } from '../scripts/constants'

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
const CryptoFiatHubMock = artifacts.require('./mocks/CryptoFiatHubMock.sol')
const Store = artifacts.require('./Store.sol')
const Rewards = artifacts.require('./Rewards.sol')
const PriceFeed = artifacts.require('./PriceFeed')

contract('Oraclize', async(accounts) => {
  let sender = accounts[0]
  let store, proofToken, cryptoDollar, rewards, priceFeed, cryptoFiatHub
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath

  let IPFSHash1 = ipfs.testing
  let IPFSHash2 = ipfs.production

  /**
   * In this series of tests, we use the testing archive that sends back a static value
   * All the different functions are tested with a mock CryptoFiatHub contract.
   */
  describe('Oraclize Testing Archive ', async() => {
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
      await CryptoFiatHubMock.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await CryptoFiatHubMock.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await CryptoFiatHubMock.link(SafeMath, safeMath.address)
      await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
      await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
      await Rewards.link(SafeMath, safeMath.address)

      // Deploy CryptoFiat Contracts
      store = await Store.new()
      proofToken = await ProofToken.new()
      cryptoDollar = await CryptoDollar.new(store.address)
      rewards = await Rewards.new(store.address, proofToken.address)
      priceFeed = await PriceFeed.new(IPFSHash1)
      cryptoFiatHub = await CryptoFiatHubMock.new(cryptoDollar.address, store.address, proofToken.address, rewards.address, priceFeed.address)

      // CryptoFiat Contract Network Setup
      await priceFeed.setCryptoFiatHub(cryptoFiatHub.address)
      await store.authorizeAccess(cryptoFiatHub.address)
      await store.authorizeAccess(cryptoDollar.address)
      await store.authorizeAccess(rewards.address)
      await cryptoDollar.authorizeAccess(cryptoFiatHub.address)
      await cryptoFiatHub.initialize(20)
    })

    it('should sucessfully call buyCryptoDollar and call correct callback', async() => {
      await cryptoFiatHub.buyCryptoDollar({ from: sender, value: 1 * ether })
      await new Promise(resolve => setTimeout(resolve, 120000))

      let fee = await cryptoFiatHub.oraclizeFee()
      console.log(fee)

      let exchangeRate = await cryptoFiatHub.exchangeRate.call()
      let buyCryptoDollarCalled = await cryptoFiatHub.buyCryptoDollarCalled.call()
      let value = await cryptoFiatHub.etherValue.call()

      exchangeRate.should.be.bignumber.equal(200)
      value.should.be.bignumber.equal(1 * ether)
      buyCryptoDollarCalled.should.be.true
    })

    it('should sucessfully call buyCryptoDollar and call correct callback on the second time', async() => {
      await cryptoFiatHub.buyCryptoDollar({ from: sender, value: 1 * ether })
      await new Promise(resolve => setTimeout(resolve, 120000))

      let fee = await cryptoFiatHub.oraclizeFee()
      console.log(fee)

      let exchangeRate = await cryptoFiatHub.exchangeRate.call()
      let buyCryptoDollarCalled = await cryptoFiatHub.buyCryptoDollarCalled.call()
      let value = await cryptoFiatHub.etherValue.call()

      exchangeRate.should.be.bignumber.equal(200)
      value.should.be.bignumber.equal(1 * ether)
      buyCryptoDollarCalled.should.be.true
    })

    // it('should sucessfully call buyCryptoDollar and call correct callback', async() => {
    //   await store.authorizeAccess(cryptoDollarStorageProxy.address)
    //   await cryptoDollarStorageProxy.setBalance(store.address, sender, 10)

    //   await cryptoFiatHub.sellCryptoDollar(1, { from: sender, value: 0.006 * ether })
    //   await new Promise(resolve => setTimeout(resolve, 120000))

    //   let exchangeRate = await cryptoFiatHub.exchangeRate.call()
    //   let sellCryptoDollarCalled = await cryptoFiatHub.sellCryptoDollarCalled.call()
    //   let value = await cryptoFiatHub.etherValue.call()

    //   exchangeRate.should.be.bignumber.equal(200)
    //   value.should.be.bignumber.equal(1)
    //   sellCryptoDollarCalled.should.be.true
    // })

    // it('should sucessfully call sellUnpeggedCryptoDollar and call correct callback', async() => {
    //   await store.authorizeAccess(cryptoDollarStorageProxy.address)
    //   await cryptoDollarStorageProxy.setBalance(store.address, sender, 10)

    //   await cryptoFiatHub.sellUnpeggedCryptoDollar(10, { from: sender, value: 0.006 * ether })
    //   await new Promise(resolve => setTimeout(resolve, 120000))

    //   let exchangeRate = await cryptoFiatHub.exchangeRate.call()
    //   let sellUnpeggedCryptoDollarCalled = await cryptoFiatHub.sellUnpeggedCryptoDollarCalled.call()
    //   let value = await cryptoFiatHub.etherValue.call()

    //   exchangeRate.should.be.bignumber.equal(200)
    //   value.should.be.bignumber.equal(1)
    //   sellUnpeggedCryptoDollarCalled.should.be.true
    // })
  })

  /**
   * In this series of tests, we use the production archive
   * The production archive returns an average (minus outliers) of all endpoint values
   * All the different functions are tested with a mock CryptoFiatHub contract.
   */
  // describe('Oraclize Production Archive', async() => {
  //   beforeEach(async() => {
  //     rewardsStorageProxy = await RewardsStorageProxy.new()
  //     cryptoFiatStorageProxy = await CryptoFiatStorageProxy.new()
  //     cryptoDollarStorageProxy = await CryptoDollarStorageProxy.new()
  //     safeMath = await SafeMath.new()

  //     // Linking libraries
  //     await ProofToken.link(SafeMath, safeMath.address)
  //     await CryptoDollar.link(CryptoDollarStorageProxy, cryptoDollarStorageProxy.address)
  //     await CryptoDollar.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
  //     await CryptoDollar.link(SafeMath, safeMath.address)
  //     await CryptoFiatHubMock.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
  //     await CryptoFiatHubMock.link(RewardsStorageProxy, rewardsStorageProxy.address)
  //     await CryptoFiatHubMock.link(SafeMath, safeMath.address)
  //     await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
  //     await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
  //     await Rewards.link(SafeMath, safeMath.address)

  //     // Deploy CryptoFiat Contracts
  //     store = await Store.new()
  //     proofToken = await ProofToken.new()
  //     cryptoDollar = await CryptoDollar.new(store.address)
  //     rewards = await Rewards.new(store.address, proofToken.address)
  //     priceFeed = await PriceFeed.new(IPFSHash2)
  //     cryptoFiatHub = await CryptoFiatHubMock.new(cryptoDollar.address, store.address, proofToken.address, rewards.address, priceFeed.address)

  //     // CryptoFiat Contract Network Setup
  //     await priceFeed.setCryptoFiatHub(cryptoFiatHub.address)
  //     await store.authorizeAccess(cryptoFiatHub.address)
  //     await store.authorizeAccess(cryptoDollar.address)
  //     await store.authorizeAccess(rewards.address)
  //     await cryptoDollar.authorizeAccess(cryptoFiatHub.address)
  //     await cryptoFiatHub.initialize(20)
  //   })

  //   it('should sucessfully call buyCryptoDollar and return a value from the production archive', async() => {
  //     await cryptoFiatHub.buyCryptoDollar({ from: sender, value: 1 * ether })
  //     await new Promise(resolve => setTimeout(resolve, 120000))

  //     let exchangeRate = await cryptoFiatHub.exchangeRate.call()
  //     console.log(exchangeRate.toNumber())
  //     exchangeRate.should.be.bignumber
  //   })
  // })
})
