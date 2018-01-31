const BigNumber = require('bignumber.js')
const chai = require('chai')
const should = chai.should

chai.use(require('chai-bignumber')())
chai.should()

const Store = artifacts.require('./Store.sol')

contract('Store', (accounts) => {
  let store

  describe('Setting and Getting values', async () => {
    beforeEach(async () => {
      store = await Store.new()
    })

    it('should set, get and delete an int', async () => {
      const value = 2 ** 250
      const key = web3.sha3('test')

      await store.setInt(key, value)
      let storedValue = await store.getInt(key)
      storedValue.toNumber().should.be.equal(value)

      await store.deleteInt(key)
      storedValue = await store.getInt(key)
      storedValue.toNumber().should.be.equal(0)
    })

    it('should set, get and delete an uint', async () => {
      const value = 2 ** 255
      const key = web3.sha3('test')

      await store.setUint(key, value)
      let storedValue = await store.getUint(key)
      storedValue.toNumber().should.equal(value)

      await store.deleteUint(key)
      storedValue = await store.getUint(key)
      storedValue.toNumber().should.be.equal(0)
    })

    it('should set, get and delete an address', async () => {
      const value = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      const key = web3.sha3('test')
      let storedValue

      await store.setAddress(key, value)
      storedValue = await store.getAddress(key)
      storedValue.should.be.equal(value)

      await store.deleteAddress(key)
      storedValue = await store.getAddress(key)
      storedValue.should.be.equal('0x0000000000000000000000000000000000000000')
    })

    it('should set, get and delete a string', async () => {
      const value = 'tai'
      const key = web3.sha3('test')
      let storedValue

      await store.setString(key, value)
      storedValue = await store.getString(key)
      storedValue.should.be.equal(value)

      await store.deleteString(key)
      storedValue = await store.getString(key)
      storedValue.should.be.equal('')
    })

    it('should set, get and delete a boolean', async () => {
      const value = true
      const key = web3.sha3('test')
      let storedValue

      await store.setBool(key, value)
      storedValue = await store.getBool(key)
      storedValue.should.be.equal(value)

      await store.deleteBool(key)
      storedValue = await store.getBool(key)
      storedValue.should.be.equal(false)
    })
  })
})
