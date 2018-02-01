const BigNumber = require('bignumber.js')
const chai = require('chai')
const should = chai.should

chai.use(require('chai-bignumber')())
chai.should()

const Store = artifacts.require('./Store.sol')
const CryptofiatStorageProxy = artifacts.require('./CryptoFiatStorageProxy.sol')

contract('CryptoFiatStorageProxy', (accounts) => {
  let store
  let cryptofiatStorageProxy

  describe('Creation timestamp', async () => {
    beforeEach(async () => {
      store = await Store.new()
      cryptofiatStorageProxy = await CryptofiatStorageProxy.new()
    })

    it('should set and get start timestamp', async () => {
      let storedValue
      let expectedValue = 1517486489

      await cryptofiatStorageProxy.setCreationTimestamp(store.address, expectedValue)
      storedValue = await cryptofiatStorageProxy.getCreationTimestamp(store.address)

      storedValue.toNumber().should.be.equal(expectedValue)
    })
  })

  describe('Creation Block Number', async () => {
    beforeEach(async () => {
      store = await Store.new()
      cryptofiatStorageProxy = await CryptofiatStorageProxy.new()
    })

    it('should set and get the initial block number', async () => {
      let storedValue
      let expectedValue = 5011402

      await cryptofiatStorageProxy.setCreationBlockNumber(store.address, expectedValue)
      storedValue = await cryptofiatStorageProxy.getCreationBlockNumber(store.address)

      storedValue.toNumber().should.be.equal(expectedValue)
    })
  })
})

