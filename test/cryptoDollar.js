import chai from 'chai'
import chaiStats from 'chai-stats'

import { expectInvalidOpcode, waitUntilTransactionsMined } from '../scripts/helpers.js'
import { ether } from '../scripts/constants.js'

chai.use(require('chai-bignumber')(web3.BigNumber))
    .use(chaiStats)
    .should()

const should = chai.should()
const CryptoDollar = artifacts.require('./CryptoDollar.sol')
const CryptoDollarStorageProxy = artifacts.require('./CryptoFiatStorageProxy.sol')
const Store = artifacts.require('./Store.sol')

contract('CryptoDollar', (accounts) => {
  let store
  let cryptoDollar
  let cryptoDollarStorage
  let sender = accounts[1]
  let receiver = accounts[2]

  beforeEach(async () => {
    store = await Store.deployed()
    cryptoDollar = await CryptoDollar.deployed()
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
      await expectInvalidOpcode(cryptoDollar.send(1 * ether), { from: sender })
    })
  })


  describe('Balances', async() => {
    it('should return user balance', async() => {
      await cryptoDollar.buy(receiver, 1, 0)
      let balance = await cryptoDollar.balanceOf(receiver)
      balance.should.be.bignumber.equal(1)

      //reset contract state
      await cryptoDollar.sell(receiver, 1, 0)
    })

    it('should return total supply', async() => {
      await cryptoDollar.buy(receiver, 1, 0)
      let totalSupply = await cryptoDollar.totalSupply()
      totalSupply.should.be.bignumber.equal(1)

      //reset contract state
      await cryptoDollar.sell(receiver, 1, 0)
    })

    it('should return reserved ether', async() => {
      await cryptoDollar.buy(receiver, 1, 1 * 10 ** 18)
      let reservedEther = await cryptoDollar.guaranteedEther(receiver)
      reservedEther.should.be.bignumber.equal(1 * 10 ** 18)

      //reset contract state
      await cryptoDollar.sell(receiver, 1, 1 * 10 ** 18)
    })
  })

  describe('Buy & Sell', async() => {
    it('should buy tokens for receiver', async () => {
      let initialSupply = await cryptoDollar.totalSupply()
      let initialBalance = await cryptoDollar.balanceOf(receiver)
      let initialGuaranteedEther = await cryptoDollar.guaranteedEther(receiver)
      await cryptoDollar.buy(receiver, 1, 1)

      let supply = await cryptoDollar.totalSupply()
      let balance = await cryptoDollar.balanceOf(receiver)
      let guaranteedEther = await cryptoDollar.guaranteedEther(receiver)

      let supplyIncrement = supply.minus(initialSupply)
      let balanceIncrement = balance.minus(initialBalance)
      let guaranteedEtherIncrement = guaranteedEther.minus(initialGuaranteedEther)

      supplyIncrement.should.be.bignumber.equal(1)
      balanceIncrement.should.be.bignumber.equal(1)
      guaranteedEtherIncrement.should.be.bignumber.equal(1)
    })

    it('should sell tokens for receiver', async () => {
      let initialSupply = await cryptoDollar.totalSupply()
      let initialBalance = await cryptoDollar.balanceOf(receiver)
      let initialGuaranteedEther = await cryptoDollar.guaranteedEther(receiver)
      await cryptoDollar.sell(receiver, 1, 1)

      let supply = await cryptoDollar.totalSupply()
      let balance = await cryptoDollar.balanceOf(receiver)
      let guaranteedEther = await cryptoDollar.guaranteedEther(receiver)

      let supplyDecrement = initialSupply.minus(supply)
      let balanceDecrement = initialBalance.minus(balance)
      let guaranteedEtherDecrement = initialGuaranteedEther.minus(guaranteedEther)

      supplyDecrement.should.be.bignumber.equal(1)
      balanceDecrement.should.be.bignumber.equal(1)
      guaranteedEtherDecrement.should.be.bignumber.equal(1)
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

      await cryptoDollar.sell(receiver, 100, 0)
    })

    it('should transfer reserved ether from sender to receiver', async() => {
      await cryptoDollar.buy(sender, 100, 1 * 10 ** 18)

      let initialSenderGuaranteedEther = await cryptoDollar.guaranteedEther(sender)
      let initialSenderBalance = await cryptoDollar.balanceOf(sender)
      let initialReceiverGuaranteedEther = await cryptoDollar.guaranteedEther(receiver)

      let txn = await cryptoDollar.transfer(receiver, 50, { from: sender })
      await waitUntilTransactionsMined(txn.tx)

      let senderGuaranteedEther = await cryptoDollar.guaranteedEther(sender)
      let receiverGuaranteedEther = await cryptoDollar.guaranteedEther(receiver)

      let expectedVariation = initialSenderGuaranteedEther.mul(50).div(initialSenderBalance)

      let senderGuaranteedEtherVariation = senderGuaranteedEther.minus(initialSenderGuaranteedEther)
      let receiverGuaranteedEtherVariation = receiverGuaranteedEther.minus(initialReceiverGuaranteedEther)

      senderGuaranteedEtherVariation.should.be.bignumber.equal(-expectedVariation)
      receiverGuaranteedEtherVariation.should.be.bignumber.equal(expectedVariation)

      //reset contract state
      await cryptoDollar.sell(receiver, 50, senderGuaranteedEther)
      await cryptoDollar.sell(sender, 50, receiverGuaranteedEther)
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

      //reset contract state
      await cryptoDollar.approve(receiver, 0, { from: sender })
      await cryptoDollar.sell(sender, 100, 1 * 10 ** 18)
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

      //reset contract state
      await cryptoDollar.sell(sender, senderBalance, 0)
      await cryptoDollar.sell(receiver, receiverBalance, 0)
    })

    it('should transfer guaranteed ether', async() => {
      let amount = 50
      let txn
      txn = await cryptoDollar.buy(sender, 100, 1 * 10 ** 18)
      await waitUntilTransactionsMined(txn.tx)

      let initialReceiverReservedEther = await cryptoDollar.guaranteedEther(receiver)
      let initialSenderReservedEther = await cryptoDollar.guaranteedEther(sender)
      let initialSenderBalance = await cryptoDollar.balanceOf(sender)

      txn = await cryptoDollar.approve(receiver, amount, { from: sender  })
      await waitUntilTransactionsMined(txn.tx)
      txn = await cryptoDollar.transferFrom(sender, receiver, 50)
      await waitUntilTransactionsMined(txn.tx)

      let etherValue = initialSenderReservedEther.mul(amount).div(initialSenderBalance)

      let receiverReservedEther = await cryptoDollar.guaranteedEther(receiver)
      let senderReservedEther = await cryptoDollar.guaranteedEther(sender)

      let receiverReservedEtherVariation = receiverReservedEther.minus(initialReceiverReservedEther)
      let senderReservedEtherVariation = senderReservedEther.minus(initialSenderReservedEther)

      receiverReservedEtherVariation.should.be.bignumber.equal(etherValue)
      senderReservedEtherVariation.should.be.bignumber.equal(-etherValue)
    })
  })
})
