import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { BigNumber } from 'bignumber.js'
import { ether } from '../scripts/constants'
import { getWeiBalance, waitUntilTransactionsMined, expectInvalidOpcode } from '../scripts/helpers'
import { getState } from '../scripts/cryptofiatHelpers'

chai.use(chaiAsPromised)
    .use(require('chai-bignumber')(web3.BigNumber))
    .should()

const should = chai.should()
const CryptoFiatHub = artifacts.require('CryptoFiatHub.sol')
const CryptoDollar = artifacts.require('CryptoDollar.sol')

contract('Cryptofiat Hub', (accounts) => {
  let cryptoFiatHub
  let cryptoDollar
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
  before(async () => {
    //we use the already deployed cryptofiathub contract
    cryptoFiatHub = await CryptoFiatHub.deployed()
    cryptoDollar = await CryptoDollar.deployed()

    //Standard scenario with an initial funding of 1 ether and payment (buy value) of 1 ether.
    funding = 1 * ether
    payment = 1 * ether

    //In this scenario, the initial exchange rate is 1 ETH = 100 USD (exchangeRate = 10000)
    //The updated exchange rate is 1 ETH = 10 USD (exchangeRate 1000)
    //The exchange rate is actually representing ethers to cents
    initialExchangeRate = await cryptoFiatHub.exchangeRate.call()
    updatedExchangeRate = initialExchangeRate / 10

    let txn = await cryptoFiatHub.capitalize({ from: fund, value: funding })
    await waitUntilTransactionsMined(txn.tx)
  })

  describe('Selling unpegged dollars', async () => {
    let txn

    before(async () => {
      let params = { from: wallet1, value: payment }
      txn = await cryptoFiatHub.buyCryptoDollar(params)
      await waitUntilTransactionsMined(txn.tx)

      txn = await cryptoFiatHub.setExchangeRate(updatedExchangeRate)
      await waitUntilTransactionsMined(txn.tx)

      tokens = await cryptoFiatHub.cryptoDollarBalance(wallet1)
      tokens = tokens.toNumber()
    })

    it('should be in an unpegged state', async () => {
      let currentState = await getState(cryptoFiatHub)
      currentState.should.be.equal('UNPEGGED')
    })

    it('should throw an invalid opcode when calling the sellCryptoDollar function', async () => {
      await expectInvalidOpcode(cryptoFiatHub.sellCryptoDollar(1, { from: wallet1 }))
    })

    it('should sell unpegged cryptodollar tokens', async () => {
      let accountBalance = web3.eth.getBalance(wallet1)
      let reservedEther = await cryptoDollar.reservedEther(wallet1)
      let params = { from: wallet1, gasPrice: 10 * 10 ** 9 }

      txn = await cryptoFiatHub.sellUnpeggedCryptoDollar(tokens, params).should.be.fulfilled
      await waitUntilTransactionsMined(txn.tx)
      let sellTxnFee = txn.receipt.gasUsed * params.gasPrice

      let finalAccountBalance = web3.eth.getBalance(wallet1)
      let finalReservedEther = await cryptoDollar.reservedEther(wallet1)

      let reservedEtherVariation = finalReservedEther.minus(reservedEther)
      let accountBalanceVariation = finalAccountBalance.minus(accountBalance)
      let expectedAccountBalanceVariation = reservedEther.minus(sellTxnFee)

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
