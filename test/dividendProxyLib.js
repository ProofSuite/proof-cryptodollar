const BigNumber = require('bignumber.js')
const chai = require('chai')
const should = chai.should

chai.use(require('chai-bignumber')())
chai.should()

const Store = artifacts.require('./Store.sol')
const DividendProxyLib = artifacts.require('./DividendProxyLib.sol')

contract('Store', (accounts) => {
  let store
  let dividendProxyLib

  describe('Pool index', async () => {
    beforeEach(async () => {
      store = await Store.new()
      dividendProxyLib = await DividendProxyLib.new()
    })

    it('should set and get current pool index', async () => {
      let poolIndex
      let expectedPoolIndex = 1

      await dividendProxyLib.setCurrentPoolIndex(store.address, 1)
      poolIndex = await dividendProxyLib.getCurrentPoolIndex(store.address)

      poolIndex.toNumber().should.be.equal(expectedPoolIndex)
    })
  })
})
