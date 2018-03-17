/* global  artifacts:true, web3: true, contract: true */
import chai from 'chai'
import { expectRevert } from '../scripts/helpers'

chai.use(require('chai-bignumber')(web3.BigNumber)).should()
const Store = artifacts.require('./Store.sol')

contract('Store', (accounts) => {
  let store
  let admin = accounts[0]
  let hacker = accounts[1]

  describe('Authorized Address', async () => {
    beforeEach(async () => {
      store = await Store.new()
      await store.authorizeAccess(admin)
    })

    it('should be able to set, get and delete an int', async () => {
      const value = 2 ** 250
      const key = web3.sha3('test')

      await store.setInt(key, value)
      let storedValue = await store.getInt(key)
      storedValue.toNumber().should.be.equal(value)

      await store.deleteInt(key)
      storedValue = await store.getInt(key)
      storedValue.toNumber().should.be.equal(0)
    })

    it('should be able to set, get and delete an uint', async () => {
      const value = 2 ** 255
      const key = web3.sha3('test')

      await store.setUint(key, value)
      let storedValue = await store.getUint(key)
      storedValue.toNumber().should.equal(value)

      await store.deleteUint(key)
      storedValue = await store.getUint(key)
      storedValue.toNumber().should.be.equal(0)
    })

    it('should be able to set, get and delete an address', async () => {
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
      const value = 'hey tai'
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

  describe('Non-authorized Address', async () => {
    beforeEach(async () => {
      store = await Store.new()
      await store.authorizeAccess(admin)
    })

    it('should not be able to set or delete an int', async () => {
      const value = 2 ** 250
      const key = web3.sha3('test')

      await expectRevert(store.setInt(key, value, { from: hacker }))
      await store.setInt(key, value, { from: admin })
      await expectRevert(store.deleteInt(key, { from: hacker }))
    })

    it('should not be able to set or delete an uint', async () => {
      const value = 2 ** 255
      const key = web3.sha3('test')

      await expectRevert(store.setUint(key, value, { from: hacker }))
      await store.setInt(key, value, { from: admin })
      await expectRevert(store.deleteUint(key, { from: hacker }))
    })

    it('should not be able to set or delete an address', async () => {
      const value = '0x3712501089ae5b863c4ff8fc32d4193fd52519e4'
      const key = web3.sha3('test')

      await expectRevert(store.setAddress(key, value, { from: hacker }))
      await store.setAddress(key, value, { from: admin })
      await expectRevert(store.deleteAddress(key, { from: hacker }))
    })

    it('should not be able to set or delete a string', async () => {
      const value = 'hey tai'
      const key = web3.sha3('test')

      await expectRevert(store.setString(key, value, { from: hacker }))
      await store.setString(key, value, { from: admin })
      await expectRevert(store.deleteString(key, { from: hacker }))
    })

    it('should not be able to set or delete boolean', async () => {
      const value = true
      const key = web3.sha3('test')

      await expectRevert(store.setBool(key, value, { from: hacker }))
      await store.setBool(key, value, { from: admin })
      await expectRevert(store.deleteBool(key, { from: hacker }))
    })
  })
})
