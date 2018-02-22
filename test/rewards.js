/* global  artifacts:true, web3: true, contract: true */
import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
import { ether } from '../scripts/constants.js'
import { expectRevert, advanceToBlock, waitUntilTransactionsMined } from '../scripts/helpers'
import { computeEpoch } from '../scripts/rewardsHelpers'

chai.use(chaiAsPromised)
.use(require('chai-bignumber')(web3.BigNumber))
.should()

const Store = artifacts.require('./Store.sol')
const Rewards = artifacts.require('./Rewards.sol')
const RewardsStorageProxy = artifacts.require('./libraries/RewardsStorageProxy.sol')
const CryptoDollarStorageProxy = artifacts.require('./libraries/CryptoDollarStorageProxy.sol')
const CryptoFiatStorageProxy = artifacts.require('./libraries/CryptoFiatStorageProxy.sol')
const CryptoDollar = artifacts.require('./CryptoDollar.sol')
const CryptoFiatHub = artifacts.require('./CryptoFiatHub.sol')
const SafeMath = artifacts.require('./libraries/SafeMath.sol')
const ProofToken = artifacts.require('./mocks/ProofToken.sol')

contract('Rewards', (accounts) => {
  let txn
  let store
  let rewards
  let cryptoDollar
  let cryptoFiatHub
  let safeMath
  let rewardsStorageProxy
  let cryptoFiatStorageProxy
  let cryptoDollarStorageProxy
  let proofToken
  let blocksPerEpoch

  let fund = accounts[0]
  let wallet = accounts[1]
  let params = { from: fund, value: 1 * ether }

  let creationBlockNumber, epoch1, epoch2

  beforeEach(async() => {
    blocksPerEpoch = 20

    // Libraries are deployed before the rest of the contracts. In the testing case, we need a clean deployment
    // state for each test so we redeploy all libraries an other contracts every time.
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
    await CryptoFiatHub.link(SafeMath, safeMath.address)
    await Rewards.link(CryptoFiatStorageProxy, cryptoFiatStorageProxy.address)
    await Rewards.link(RewardsStorageProxy, rewardsStorageProxy.address)
    await Rewards.link(SafeMath, safeMath.address)

    // We mint 1000 tokens and transfer half of them to the testing wallet address.
    proofToken = await ProofToken.new()
    txn = await proofToken.mint(fund, 1000)
    await waitUntilTransactionsMined(txn.tx)
    txn = await proofToken.transfer(wallet, 500, { from: fund })
    await waitUntilTransactionsMined(txn.tx)

    // We deploy the rest of the contracts. The Proof tokens are already allocated before the first epoch
    store = await Store.new()
    rewards = await Rewards.new(store.address, proofToken.address)
    cryptoDollar = await CryptoDollar.new(store.address)
    cryptoFiatHub = await CryptoFiatHub.new(cryptoDollar.address, store.address, proofToken.address, rewards.address)

    await store.authorizeAccess(cryptoFiatHub.address)
    await store.authorizeAccess(cryptoDollar.address)
    await store.authorizeAccess(rewards.address)
    await cryptoDollar.authorizeAccess(cryptoFiatHub.address)

    await cryptoFiatHub.initialize(blocksPerEpoch)

    creationBlockNumber = await cryptoFiatStorageProxy.getCreationBlockNumber(store.address)
    epoch1 = creationBlockNumber.plus(blocksPerEpoch).toNumber()
    epoch2 = creationBlockNumber.plus(2 * blocksPerEpoch).toNumber()
  })

  describe('State variables', async() => {

    it('should set the store reference', async() => {
      let address = await rewards.store.call()
      address.should.not.equal(0x0)
    })

    it('should set the proof token reference', async() => {
      let address = await rewards.proofToken.call()
      address.should.not.equal(0x0)
    })
  })

  describe('Receive rewards', async() => {
    it('should update the contract balance when receiving rewards', async() => {
      await rewards.receiveRewards(params)

      let balance = web3.eth.getBalance(rewards.address)
      balance.should.be.bignumber.equal(10 ** 18)
    })

    it('should update the current pool balance when receiving rewards', async() => {
      await rewards.receiveRewards(params)

      let currentPoolBalance = await rewards.getCurrentPoolBalance()
      currentPoolBalance.should.be.bignumber.equal(1 * ether)
    })

    it('should throw an invalid opcode if calling receiveRewards() with an null value', async () => {
      let emptyTx = { from: fund, value: 0 * ether }
      await expectRevert(rewards.receiveRewards(emptyTx))
    })
  })

  describe('Epochs', async() => {
    it('should get the current epoch', async() => {
      let currentBlockNumber = web3.eth.blockNumber
      let epoch = await rewards.getCurrentEpoch()

      let expectedEpoch = computeEpoch(currentBlockNumber, creationBlockNumber, blocksPerEpoch)
      epoch.should.be.bignumber.equal(expectedEpoch)
    })

    it('receiveRewards() should update the epoch', async() => {
      let initialEpoch = await rewards.getCurrentEpoch()

      params = { from: fund, value: 1 * ether }
      await rewards.receiveRewards(params)
      await advanceToBlock(epoch1)
      await rewards.receiveRewards(params) // We call the receive dividends function again to trigger the update epoch modifier

      let epoch = await rewards.getCurrentEpoch()
      epoch.should.be.bignumber.equal(initialEpoch.add(1))

      let poolBalance = await rewards.getCurrentPoolBalance()
      poolBalance.should.be.bignumber.equal(1 * ether)

      let previousPoolBalance = await rewards.getNthPoolBalance(initialEpoch)
      previousPoolBalance.should.be.bignumber.equal(1 * ether)
    })

    it('receiveRewards() should set the current pool balance to 0 if the epoch is updated', async() => {
      let initialEpoch = await rewards.getCurrentEpoch()

      params = { from: fund, value: 1 * ether }
      await rewards.receiveRewards(params)
      await advanceToBlock(epoch1) // We call the receive dividends function again to trigger the epoch udpate
      await rewards.receiveRewards(params)

      let poolBalance = await rewards.getCurrentPoolBalance()
      poolBalance.should.be.bignumber.equal(1 * ether)

      let previousPoolBalance = await rewards.getNthPoolBalance(initialEpoch)
      previousPoolBalance.should.be.bignumber.equal(1 * ether)
    })

    it('getBlockNumberAtEpochStart() should return the blocknumber corresponding to an epoch start', async() => {
      let blockNumber

      // We test the functions for 2 blocks within the second epoch
      let epochIndex = 2
      let block1 = Math.round(epoch2 + blocksPerEpoch / 4)
      let block2 = Math.round(epoch2 + blocksPerEpoch * 3 / 4)

      await advanceToBlock(block1)
      blockNumber = await rewards.getBlockNumberAtEpochStart(epochIndex)
      blockNumber.should.be.bignumber.equals(epoch2)

      await advanceToBlock(block2)
      blockNumber = await rewards.getBlockNumberAtEpochStart(epochIndex)
      blockNumber.should.be.bignumber.equals(epoch2)
    })
  })

  describe('Withdraw rewards', async() => {
    it('withdrawRewards() should throw if the caller already withdraw dividends during this epoch', async() => {
      await expectRevert(rewards.withdrawRewards({ from: wallet }))
    })

    it('withdrawRewards() should return half of the dividends corresponding to the pool of the previous epoch', async() => {
      let txn, txnFee
      let initialBalance = web3.eth.getBalance(wallet)

      // dividends are sent during the first epoch (epoch 0)
      params = { from: fund, value: 1 * ether }
      txn = await rewards.receiveRewards(params)
      await waitUntilTransactionsMined(txn.tx)

      // advance to second epoch (epoch 1)
      await advanceToBlock(epoch1)

      // rewards are withdrawn during the second epoch (epoch 1). The rewards corresponding to epoch 0 are sent.
      params = { from: wallet, gasPrice: 10 * 10 ** 9 }
      txn = await rewards.withdrawRewards(params)
      txnFee = params.gasPrice * txn.receipt.gasUsed

      let balance = web3.eth.getBalance(wallet)
      let balanceIncrement = balance.minus(initialBalance)

      // the testing address is entitled to 50% of dividends for epoch 0. (epoch 1 is not over yet, so no dividends corresponding to this epoch)
      let expectedPayment = new web3.BigNumber(0.5 * ether)
      let expectedBalanceIncrement = expectedPayment.minus(txnFee)
      balanceIncrement.should.be.bignumber.equal(expectedBalanceIncrement)
    })

    it('withdrawRewards() should return correct amount of dividends corresponding to the pool of 2 previous epochs', async() => {
      let txn
      let txnFee1, txnFee2
      let initialBalance = web3.eth.getBalance(wallet)

      // dividends are sent during the first epoch (epoch 0)
      params = { from: fund, value: 1 * ether }
      txn = await rewards.receiveRewards(params)
      await waitUntilTransactionsMined(txn.tx)

      // 250 tokens are sent out of the wallet during the first epoch (epoch 0). There are 250 remaining tokens
      params = { from: wallet, gasPrice: 10 * 10 ** 9 }
      txn = await proofToken.transfer(fund, 250, params)
      txnFee1 = params.gasPrice * txn.receipt.gasUsed
      await waitUntilTransactionsMined(txn.tx)

      // advance to second epoch (epoch 1)
      await advanceToBlock(epoch1)

      // rewards are sent to the reward pool during the second epoch (epoch 1)
      params = { from: fund, value: 1 * ether }
      txn = await rewards.receiveRewards(params)
      await waitUntilTransactionsMined(txn.tx)

      // advance to third epoch (epoch 2)
      await advanceToBlock(epoch2)

      // rewards are withdraw during the third epoch (epoch 2). The rewards corresponding to the epochs 0 and 1 are sent
      params = { from: wallet, gasPrice: 10 * 10 ** 9 }
      txn = await rewards.withdrawRewards(params)
      txnFee2 = params.gasPrice * txn.receipt.gasUsed

      // the testing address is entitled for 50% of dividends for epoch 0 and 25% of dividends of epoch 1 (~= 0.75 ether)
      let balance = web3.eth.getBalance(wallet)
      let balanceIncrement = balance.minus(initialBalance)
      let expectedPayment = new web3.BigNumber(0.75 * ether)
      let expectedBalanceIncrement = expectedPayment.minus(txnFee1).minus(txnFee2)
      balanceIncrement.should.be.bignumber.equal(expectedBalanceIncrement)
    })
  })
})
