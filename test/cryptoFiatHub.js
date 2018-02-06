import chai from 'chai'
chai.use(require('chai-bignumber')(web3.BigNumber)).should()

const should = chai.should()
const CryptoDollar = artifacts.require('CryptoDollar.sol')
const CryptoFiatHub = artifacts.require('CryptoFiatHub.sol')
const CryptoDollarStorageProxy = artifacts.require('CryptoDollarStorageProxy.sol')
const CryptoFiatStorageProxy = artifacts.require('CryptoFiatStorageProxy.sol')
const Store = artifacts.require('./Store.sol')

contract('Cryptofiat Hub', (accounts) => {
  let store
  let cryptoDollar
  let cryptoFiatStorageProxy
  let cryptoFiatHub

  beforeEach(async () => {
    store = await Store.deployed()
    cryptoDollar = await CryptoDollar.deployed()
    cryptoFiatHub = await CryptoFiatHub.deployed()
    cryptoFiatStorageProxy = await CryptoFiatStorageProxy.deployed()
  })

  describe('State variables', async () => {
    it('should set the initial blocknumber', async () => {
      let blockNumber = await cryptoFiatStorageProxy.getCreationBlockNumber(store.address)
      blockNumber.should.be.not.equal(0)
    })

    it('should set the Proof Token reference', async() => {
      let address = await cryptoFiatHub.proofToken.call()
      address.should.not.equal(0x0)
    })

    it('should set the CryptoDollar Token reference', async() => {
      let address = await cryptoFiatHub.cryptoDollar.call()
      address.should.not.equal(0x0)
    })

    it('should set the Store reference', async() => {
      let address = await cryptoFiatHub.store.call()
      address.should.not.equal(0x0)
    })
  })
})
