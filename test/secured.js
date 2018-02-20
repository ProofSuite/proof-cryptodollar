/* global  artifacts:true, contract: true */
import chai from 'chai'
import { expectInvalidOpcode, waitUntilTransactionsMined } from '../scripts/helpers'

chai.should()

const should = chai.should()
const SecureContract = artifacts.require('./mocks/SecureContract.sol')

contract('Secured', (accounts) => {
  let securedContract
  let wallet1 = accounts[0]
  let wallet2 = accounts[1]
  let wallet3 = accounts[2]

  beforeEach(async() => {
    securedContract = await SecureContract.new()
  })

  describe('Ownership', async () => {
    it('should initially be owned by the msg.sender', async() => {
      let owner = await securedContract.owner.call()
      owner.should.be.equal(wallet1)
    })

    it('should be able to transfer ownership', async() => {
      await securedContract.transferOwnership(wallet2, { from: wallet1 })

      let owner = await securedContract.owner.call()
      owner.should.be.equal(wallet2)
    })

    it('only owner should be able to transfer ownership', async() => {
      await expectInvalidOpcode(securedContract.transferOwnership(wallet2, { from: wallet2 }))

      let owner = await securedContract.owner.call()
      owner.should.be.equal(wallet1)
    })

    it('should allow locking ownership', async() => {
      let txn = await securedContract.lockOwnership()
      await waitUntilTransactionsMined(txn.tx)

      let locked = await securedContract.locked.call()
      locked.should.be.equal(true)
    })

    it('non owner wallet should not be able to lock ownership', async() => {
      await expectInvalidOpcode(securedContract.lockOwnership({ from: wallet2 }))

      let locked = await securedContract.locked.call()
      locked.should.be.equal(false)
    })

    it('should not be able to transfer ownership after ownership is locked', async() => {
      await securedContract.lockOwnership()

      await expectInvalidOpcode(securedContract.transferOwnership(wallet2, { from: wallet1 }))

      let owner = await securedContract.owner.call()
      owner.should.be.equal(wallet1)
    })
  })

  describe('Authorizations', async () => {
    it('should initially have no authorizations', async() => {
      let authorizations = securedContract.getAuthorizations.call()
      authorizations.should.be.empty
    })

    it('should authorize access to a single address', async() => {
      await securedContract.authorizeAccess(wallet2)

      let authorizations = await securedContract.getAuthorizations()
      authorizations.should.be.deep.equal([wallet2])
      let authorized = await securedContract.isAuthorized(wallet2)
      authorized.should.be.true
    })

    it('should revoke the access to a single address', async() => {
      let authorized
      await securedContract.authorizeAccess(wallet2)
      authorized = await securedContract.isAuthorized(wallet2)
      authorized.should.be.true

      await securedContract.revokeAccess(wallet2)
      authorized = await securedContract.isAuthorized(wallet2)
      authorized.should.be.false
    })

    it('should replace access', async() => {
      let authorized = {}
      let authorizations

      await securedContract.authorizeAccess(wallet2)
      authorized.wallet2 = await securedContract.isAuthorized(wallet2)
      authorized.wallet3 = await securedContract.isAuthorized(wallet3)
      authorizations = await securedContract.getAuthorizations()

      authorizations.should.be.deep.equal([wallet2])
      authorized.wallet2.should.be.true
      authorized.wallet3.should.be.false

      let txn = await securedContract.replaceAccess(wallet2, wallet3)
      await waitUntilTransactionsMined(txn.tx)
      authorized.wallet2 = await securedContract.isAuthorized(wallet2)
      authorized.wallet3 = await securedContract.isAuthorized(wallet3)
      authorizations = await securedContract.getAuthorizations()

      authorizations.should.be.deep.equal([wallet3])
      authorized.wallet2.should.be.false
      authorized.wallet3.should.be.true
    })

    it('only the owner should be able to authorize access', async() => {
      await expectInvalidOpcode(securedContract.authorizeAccess(wallet2, { from: wallet2 }))
    })

    it('only the owner should be able to revoke access', async() => {
      await securedContract.authorizeAccess(wallet2)
      let authorization = await securedContract.isAuthorized(wallet2)
      authorization.should.be.true

      await expectInvalidOpcode(securedContract.revokeAccess(wallet2, { from: wallet3 }))
    })

    it('only the owner should be able to replace access', async() => {
      let authorized = {}
      await securedContract.authorizeAccess(wallet2)
      authorized.wallet2 = await securedContract.isAuthorized(wallet2)
      authorized.wallet3 = await securedContract.isAuthorized(wallet3)

      authorized.wallet2.should.be.true
      authorized.wallet3.should.be.false

      await expectInvalidOpcode(securedContract.replaceAccess(wallet2, wallet3, { from: wallet3 }))

      authorized.wallet2 = await securedContract.isAuthorized(wallet2)
      authorized.wallet3 = await securedContract.isAuthorized(wallet3)

      authorized.wallet2.should.be.true
      authorized.wallet3.should.be.false
    })

    it('getAuthorizations() should return a list of authorized addresses', async() => {
      await securedContract.authorizeAccess(wallet2)
      await securedContract.authorizeAccess(wallet3)

      let authorizations = await securedContract.getAuthorizations()
      authorizations.should.be.deep.equal([wallet2, wallet3])
    })
  })

  describe('Locking authorizations', async() => {
    it('owner should be able to lock authorizations', async() => {
      await securedContract.lockAuthorizations().should.be.fulfilled

      let authorizationsLocked = await securedContract.authorizationsLocked.call()
      authorizationsLocked.should.be.true
    })

    it('non owner should not be able to lock authorizations', async() => {
      await expectInvalidOpcode(securedContract.lockAuthorizations({ from: wallet2 }))

      let authorizationsLocked = await securedContract.authorizationsLocked.call()
      authorizationsLocked.should.be.false
    })

    it('owner should not be able to authorize access if authorizations have been locked', async() => {
      await securedContract.lockAuthorizations()

      await expectInvalidOpcode(securedContract.authorizeAccess(wallet2))
      let authorized = await securedContract.isAuthorized(wallet2)
      authorized.should.be.false
    })

    it('owner should not be able to revoke access if authorizations have been locked', async() => {
      await securedContract.authorizeAccess(wallet2)
      await securedContract.lockAuthorizations()

      await expectInvalidOpcode(securedContract.revokeAccess(wallet2))
      let authorized = await securedContract.isAuthorized(wallet2)
      authorized.should.be.true
    })

    it('owner should not be able to replace access if authorizations have been locked', async() => {
      let authorized = {}
      await securedContract.authorizeAccess(wallet2)
      await securedContract.lockAuthorizations()

      await expectInvalidOpcode(securedContract.replaceAccess(wallet2, wallet3))
      authorized.wallet2 = await securedContract.isAuthorized(wallet2)
      authorized.wallet3 = await securedContract.isAuthorized(wallet3)
      authorized.wallet2.should.be.true
      authorized.wallet3.should.be.false
    })
  })

  describe('Updating secured data', async() => {
    it('authorized address should be able to update data', async() => {
      await securedContract.authorizeAccess(wallet2)

      await securedContract.set(true, { from: wallet2 }).should.be.fulfilled
      let value = await securedContract.a.call()
      value.should.be.true
    })

    it('non-authorized address should not be able to update data', async() => {
      await expectInvalidOpcode(securedContract.set(true, { from: wallet2 }))
      let value = await securedContract.a.call()
      value.should.be.false
    })
  })
})
