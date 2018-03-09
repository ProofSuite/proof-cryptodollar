/* global  artifacts:true, web3: true, contract: true */
import chai from 'chai'
import { expectRevert } from '../scripts/helpers.js'
import { ether } from '../scripts/constants.js'

chai.use(require('chai-bignumber')(web3.BigNumber)).should()

const RewardsStorageProxy = artifacts.require('./libraries/RewardsStorageProxy.sol')
const CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
const CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
const SafeMath = artifacts.require('./libraries/SafeMath.sol')
const CryptoDollar = artifacts.require('./CryptoDollar.sol')
const CryptoFiatHub = artifacts.require('./CryptoFiatHub.sol')
const ProofToken = artifacts.require('./mocks/ProofToken.sol')
const Store = artifacts.require('./Store.sol')
const Rewards = artifacts.require('./Rewards.sol')

contract('CryptoDollar', (accounts) => {
  let rewardsStorageProxy, cryptoFiatStorageProxy, cryptoDollarStorageProxy, safeMath
  let store, cryptoDollar
  let admin = accounts[0]
  let sender = accounts[1]
  let receiver = accounts[2]
  let hacker = accounts[3]

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

    store = await Store.new()
    cryptoDollar = await CryptoDollar.new(store.address)

    await Promise.all([
      store.authorizeAccess(cryptoDollar.address),
      cryptoDollar.authorizeAccess(admin)
    ])
  })

  describe('State variables', async () => {
    it('should be named Cryptodollar', async () => {
      let name = await cryptoDollar.name.call()
      name.should.equal('CryptoDollar')
    })

    it('should have symbol CUSD', async () => {
      let symbol = await cryptoDollar.symbol.call()
      symbol.should.equal('CUSD')
    })

    it('should have 2 decimals', async () => {
      let decimals = await cryptoDollar.decimals.call()
      decimals.should.be.bignumber.equal(2)
    })

    it('should have an initial total supply of 0', async () => {
      let totalSupply = await cryptoDollar.totalSupply.call()
      totalSupply.should.be.bignumber.equal(0)
    })

    it('store address should be initialized', async () => {
      let storeAddress = await cryptoDollar.store.call()
      storeAddress.should.be.equal(store.address)
    })
  })

  describe('Fallback function', async () => {
    it('should return invalid opcode', async () => {
      await expectRevert(cryptoDollar.send(1 * ether), { from: sender })
    })
  })

  describe('Balances', async() => {
    it('should return user balance', async() => {
      await cryptoDollar.buy(receiver, 1, 0)
      let balance = await cryptoDollar.balanceOf(receiver)
      balance.should.be.bignumber.equal(1)
    })

    it('should return total supply', async() => {
      await cryptoDollar.buy(receiver, 1, 0)
      let totalSupply = await cryptoDollar.totalSupply()
      totalSupply.should.be.bignumber.equal(1)
    })

    it('should return reserved ether', async() => {
      await cryptoDollar.buy(receiver, 1, 1 * 10 ** 18)
      let reservedEther = await cryptoDollar.reservedEther(receiver)
      reservedEther.should.be.bignumber.equal(1 * 10 ** 18)
    })
  })

  describe('Buy & Sell', async() => {
    it('should buy tokens for receiver', async () => {
      let initialState = await Promise.all([
        cryptoDollar.totalSupply(),
        cryptoDollar.balanceOf(receiver),
        cryptoDollar.reservedEther(receiver)])
      let [initialSupply, initialBalance, initialReservedEther] = initialState

      await cryptoDollar.buy(receiver, 1, 1)

      let finalState = await Promise.all([
        cryptoDollar.totalSupply(),
        cryptoDollar.balanceOf(receiver),
        cryptoDollar.reservedEther(receiver)])
      let [supply, balance, reservedEther ] = finalState

      let supplyIncrement = supply.minus(initialSupply)
      let balanceIncrement = balance.minus(initialBalance)
      let reservedEtherIncrement = reservedEther.minus(initialReservedEther)
      supplyIncrement.should.be.bignumber.equal(1)
      balanceIncrement.should.be.bignumber.equal(1)
      reservedEtherIncrement.should.be.bignumber.equal(1)
    })

    it('should sell tokens for receiver', async() => {
      await cryptoDollar.buy(receiver, 1, 1)

      let initialState = await Promise.all([
        cryptoDollar.totalSupply(),
        cryptoDollar.balanceOf(receiver),
        cryptoDollar.reservedEther(receiver)])
      let [initialSupply, initialBalance, initialReservedEther] = initialState

      await cryptoDollar.sell(receiver, 1, 1)

      let finalState = await Promise.all([
        cryptoDollar.totalSupply(),
        cryptoDollar.balanceOf(receiver),
        cryptoDollar.reservedEther(receiver)])
      let [supply, balance, reservedEther] = finalState

      let supplyDecrement = initialSupply.minus(supply)
      let balanceDecrement = initialBalance.minus(balance)
      let reservedEtherDecrement = initialReservedEther.minus(reservedEther)
      supplyDecrement.should.be.bignumber.equal(1)
      balanceDecrement.should.be.bignumber.equal(1)
      reservedEtherDecrement.should.be.bignumber.equal(1)
    })

    it('buy should only be callable by the cryptoDollar (or authorized contract)', async() => {
      await expectRevert(cryptoDollar.buy(hacker, 1, 1, { from: hacker }))
    })
  })

  describe('Transfer', async() => {

    it('should transfer tokens from sender to receiver', async() => {
      await cryptoDollar.buy(sender, 100, 0)
      let initialSenderBalance = await cryptoDollar.balanceOf(sender)
      let initialReceiverBalance = await cryptoDollar.balanceOf(receiver)

      await cryptoDollar.transfer(receiver, 100, { from: sender })
      let senderBalance = await cryptoDollar.balanceOf(sender)
      let receiverBalance = await cryptoDollar.balanceOf(receiver)

      let senderBalanceVariation = senderBalance.minus(initialSenderBalance)
      let receiverBalanceVariation = receiverBalance.minus(initialReceiverBalance)
      senderBalanceVariation.should.be.bignumber.equal(-100)
      receiverBalanceVariation.should.be.bignumber.equal(+100)
    })

    it('should transfer reserved ether from sender to receiver', async() => {
      await cryptoDollar.buy(sender, 100, 1 * 10 ** 18)

      let initialState = await Promise.all([
        cryptoDollar.reservedEther(sender),
        cryptoDollar.balanceOf(sender),
        cryptoDollar.reservedEther(receiver)])
      let [initialSenderReservedEther, initialSenderBalance, initialReceiverReservedEther] = initialState

      await cryptoDollar.transfer(receiver, 50, { from: sender })

      let finalState = await Promise.all([
        cryptoDollar.reservedEther(sender),
        cryptoDollar.reservedEther(receiver)])
      let [senderReservedEther, receiverReservedEther] = finalState

      let expectedVariation = initialSenderReservedEther.mul(50).div(initialSenderBalance)
      let senderReservedEtherVariation = senderReservedEther.minus(initialSenderReservedEther)
      let receiverReservedEtherVariation = receiverReservedEther.minus(initialReceiverReservedEther)
      senderReservedEtherVariation.should.be.bignumber.equal(-expectedVariation)
      receiverReservedEtherVariation.should.be.bignumber.equal(expectedVariation)
    })

    it('should not be able to transfer more tokens than balance', async() => {
      await cryptoDollar.buy(sender, 100, 1 * 10 ** 18)

      let initialState = await Promise.all([
        cryptoDollar.balanceOf(sender),
        cryptoDollar.balanceOf(receiver),
        cryptoDollar.reservedEther(sender),
        cryptoDollar.reservedEther(receiver)])
      let [initialSenderBalance, initialReceiverBalance, initialSenderReservedEther, initialReceiverReservedEther] = initialState

      await expectRevert(cryptoDollar.transfer(receiver, 101, { from: sender }))

      let finalState = await Promise.all([
        cryptoDollar.balanceOf(sender),
        cryptoDollar.balanceOf(receiver),
        cryptoDollar.reservedEther(sender),
        cryptoDollar.reservedEther(receiver)])
      let [senderBalance, receiverBalance, senderReservedEther, receiverReservedEther] = finalState

      let senderBalanceVariation = senderBalance.minus(initialSenderBalance)
      let senderReservedEtherVariation = senderReservedEther.minus(initialSenderReservedEther)
      let receiverBalanceVariation = receiverBalance.minus(initialReceiverBalance)
      let receiverReservedEtherVariation = receiverReservedEther.minus(initialReceiverReservedEther)

      senderBalanceVariation.should.be.bignumber.equal(0)
      receiverBalanceVariation.should.be.bignumber.equal(0)
      senderReservedEtherVariation.should.be.bignumber.equal(0)
      receiverReservedEtherVariation.should.be.bignumber.equal(0)
    })
  })

  describe('Approve and TransferFrom', async() => {
    it('should approve tokens', async() => {
      let amount = 50
      await cryptoDollar.buy(sender, 100, 1 * 10 ** 18)

      let initialReceiverAllowance = await cryptoDollar.allowance(sender, receiver);
      await cryptoDollar.approve(receiver, amount, { from: sender })

      let receiverAllowance = await cryptoDollar.allowance(sender, receiver);
      let difference = receiverAllowance.minus(initialReceiverAllowance)
      difference.should.be.bignumber.equal(amount)
    })

    it('should transfer tokens', async() => {
      let amount = 50
      await cryptoDollar.buy(sender, 100, 0)
      let initialReceiverBalance = await cryptoDollar.balanceOf(receiver)
      let initialSenderBalance = await cryptoDollar.balanceOf(sender)

      await cryptoDollar.approve(receiver, amount, { from: sender })
      await cryptoDollar.transferFrom(sender, receiver, 50)

      let receiverBalance = await cryptoDollar.balanceOf(receiver)
      let senderBalance = await cryptoDollar.balanceOf(sender)

      let receiverBalanceVariation = receiverBalance.minus(initialReceiverBalance)
      let senderBalanceVariation = senderBalance.minus(initialSenderBalance)
      receiverBalanceVariation.should.be.bignumber.equal(amount)
      senderBalanceVariation.should.be.bignumber.equal(-amount)
    })

    it('should not be able to transfer more tokens than allowed', async() => {
      let amount = 50
      await cryptoDollar.buy(sender, 100, 0)
      await cryptoDollar.approve(receiver, amount, { from: sender })
      await expectRevert(cryptoDollar.transferFrom(sender, receiver, 51))
    })

    it('should transfer reserved ether', async() => {
      let amount = 50
      await cryptoDollar.buy(sender, 100, 1 * 10 ** 18)

      let initialState = await Promise.all([
        cryptoDollar.balanceOf(sender),
        cryptoDollar.reservedEther(sender),
        cryptoDollar.reservedEther(receiver)])
      let [initialSenderBalance, initialSenderReservedEther, initialReceiverReservedEther] = initialState

      await cryptoDollar.approve(receiver, amount, { from: sender })
      await cryptoDollar.transferFrom(sender, receiver, 50)

      let etherValue = initialSenderReservedEther.mul(amount).div(initialSenderBalance)
      let finalState = await Promise.all([
        cryptoDollar.reservedEther(receiver),
        cryptoDollar.reservedEther(sender)])
      let [senderReservedEther, receiverReservedEther] = finalState

      let receiverReservedEtherVariation = receiverReservedEther.minus(initialReceiverReservedEther)
      let senderReservedEtherVariation = senderReservedEther.minus(initialSenderReservedEther)
      receiverReservedEtherVariation.should.be.bignumber.equal(etherValue)
      senderReservedEtherVariation.should.be.bignumber.equal(-etherValue)
    })
  })
})
