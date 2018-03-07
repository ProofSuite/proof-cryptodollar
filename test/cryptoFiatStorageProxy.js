/* global  artifacts:true, web3: true, contract: true */
import chai from 'chai'

chai.use(require('chai-bignumber')(web3.BigNumber))
chai.should()

const Store = artifacts.require('./Store.sol')
const CryptofiatStorageProxy = artifacts.require('./CryptoFiatStorageProxy.sol')

contract('CryptoFiatStorageProxy', (accounts) => {
  let store
  let cryptofiatStorageProxy

  beforeEach(async () => {
    store = await Store.new()
    cryptofiatStorageProxy = await CryptofiatStorageProxy.new()
    await store.authorizeAccess(cryptofiatStorageProxy.address)
  })

  describe('Creation timestamp', async () => {
    it('should set and get start timestamp', async () => {
      let storedValue
      let expectedValue = 1517486489

      await cryptofiatStorageProxy.setCreationTimestamp(store.address, expectedValue)
      storedValue = await cryptofiatStorageProxy.getCreationTimestamp(store.address)
      storedValue.should.be.bignumber.equal(expectedValue)
    })
  })

  describe('Creation Block Number', async () => {
    it('should set and get the initial block number', async () => {
      let storedValue
      let expectedValue = 5011402

      await cryptofiatStorageProxy.setCreationBlockNumber(store.address, expectedValue)
      storedValue = await cryptofiatStorageProxy.getCreationBlockNumber(store.address)
      storedValue.should.be.bignumber.equal(expectedValue)
    })
  })
})

