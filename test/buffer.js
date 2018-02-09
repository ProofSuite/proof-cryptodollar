import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../scripts/constants'
import { getWeiBalance, waitUntilTransactionsMined } from '../scripts/helpers'
import { getState } from '../scripts/cryptofiatHelpers'

chai.use(chaiAsPromised)
    .use(require('chai-bignumber')(web3.BigNumber))
    .should()

const should = chai.should()
const CryptoFiatHub = artifacts.require('CryptoFiatHub.sol')

contract('Buffer', (accounts) => {
  let cryptoFiatHub
  let fund = accounts[0]
  let wallet1 = accounts[1]
  let wallet2 = accounts[2]
  let initialExchangeRate
  let updatedExchangeRate
  let funding
  let payment
  let rewardsFee
  let bufferFee

  /*
  The initial exchange rate is equal to 1 ETH = 100 USD (in cents, exchangeRate = 10000)
  The contract is initially capitalized with 1 ether
  The first user (wallet1) buys 1000 tokens therefore the contract state is initially:

  buffer = contractbalance - outstanding = 2 ether - ~1000 cryptodollar tokens = 2 ether - 10 ether = 1 ether
  buffer > 0

  The exchange rate drops and is now equal to 1 ETH = 10 USD (in cents, exchangeRate = 100)

  buffer = contractbalance - outstanding = 11 ether - 1000 cryptodollar tokens = 11 ether - 100 ether = - 89 ether
  **/
  before(async () => {
    cryptoFiatHub = await CryptoFiatHub.deployed()
    initialExchangeRate = await cryptoFiatHub.exchangeRate.call()
    updatedExchangeRate = initialExchangeRate / 10
    funding = 1 * ether
    payment = 1 * ether
    rewardsFee = 0.005 * payment
    bufferFee = 0.005 * payment

    let txn = await cryptoFiatHub.capitalize({ from: fund, value: funding })
    await waitUntilTransactionsMined(txn.tx)
  })

  describe('Initial Buffer State', async () => {
    it('contract balance should be equal to initial funding', async() => {
      let contractBalance = await cryptoFiatHub.contractBalance()
      contractBalance.should.be.bignumber.equal(10 ** 18)
    })

    it('total outstanding should be equal to 0', async() => {
      let totalOutstanding = await cryptoFiatHub.totalOutstanding()
      totalOutstanding.should.be.bignumber.equal(0)
    })

    it('buffer should be equal to 0', async() => {
      let buffer = await cryptoFiatHub.buffer()
      buffer.should.be.bignumber.equal(10 ** 18)
    })
  })


  describe('Buffer state', async () => {

    before(async() => {
      let txn = await cryptoFiatHub.buyCryptoDollar({ from: wallet1, value: 1 * ether })
      await waitUntilTransactionsMined(txn.tx)
    })

    it('contract balance should be equal to funding + payment - rewards fee', async () => {
      let balance = await cryptoFiatHub.contractBalance()
      let expectedBalance = funding + payment - rewardsFee
      balance.should.be.bignumber.equal(expectedBalance)
    })

    it('total outstanding should be equal to 1 ether - rewards fee - buffer fee', async () => {
      let totalOutstanding = await cryptoFiatHub.totalOutstanding()
      let expectedTotalOutstanding = payment - rewardsFee - bufferFee
      totalOutstanding.should.be.bignumber.equal(expectedTotalOutstanding)
    })

    it('buffer should be equal to initial buffer + buffer fee', async () => {
      let buffer = await cryptoFiatHub.buffer()
      let expectedBuffer = funding + bufferFee

      buffer.should.be.bignumber.equal(expectedBuffer)
    })
  })


  describe('Buffer (Unpegged) state', async () => {
    before(async() => {
      let txn = await cryptoFiatHub.setExchangeRate(updatedExchangeRate)
      await waitUntilTransactionsMined(txn.tx)
    })

    it('contract balance should be equal to initial funding + 1 ether - rewards fee', async () => {
      let balance = await cryptoFiatHub.contractBalance()
      let expectedBalance = funding + payment - rewardsFee
      balance.should.be.bignumber.equal(expectedBalance)
    })

    it('total outstanding should be equal to total outstanding tokens x exchange rate', async () => {
      let totalOutstanding = await cryptoFiatHub.totalOutstanding()
      let tokenSupply = await cryptoFiatHub.cryptoDollarTotalSupply()
      let expectedTotalOutstanding = tokenSupply.times(1 * ether).div(updatedExchangeRate)

      totalOutstanding.should.be.bignumber.equal(expectedTotalOutstanding)
    })

    it('buffer should be negative', async () => {
      let contractBalance = await cryptoFiatHub.contractBalance()
      let totalOutstanding = await cryptoFiatHub.totalOutstanding()

      contractBalance.minus(totalOutstanding).should.be.bignumber.below(0)
    })

    it('buffer should be equal to initial funding + 1 ether - rewards fee - token supply * exchange rate', async () => {
      let tokenSupply = await cryptoFiatHub.cryptoDollarTotalSupply()
      let bufferValue = await cryptoFiatHub.buffer()
      let balance = funding + payment - rewardsFee
      let outstanding = tokenSupply.times(1 * ether).div(updatedExchangeRate).toNumber()
      let expectedBufferValue = balance - outstanding
      bufferValue.should.be.bignumber.equal(expectedBufferValue)
    })
  })
})
