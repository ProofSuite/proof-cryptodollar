import chai from 'chai'
import { expectInvalidOpcode } from '../scripts/helpers.js'
import { ether } from '../scripts/constants.js'

chai.should()

const CryptoDollar = artifacts.require('./CryptoDollar.sol')

contract('CryptoDollar', (accounts) => {
  let cryptoDollar
  let sender = accounts[1]
  let receiver = accounts[2]

  before(async function() {
    cryptoDollar = await CryptoDollar.new()
  })

  describe('State variables', async () => {
    it('should be named Cryptodollar', async () => {
      let name = await cryptoDollar.name.call()
      name.should.equal('CryptoDollar')
    })

    it('should have symbol CUSD', async () => {
      let symbol = await cryptoDollar.symbol.call()
      symbol.should.equal('CUSD')
    })

    it('should have 2 decimals', async () => {
      let decimals = await cryptoDollar.decimals.call()
      decimals.toNumber().should.equal(2)
    })
  })

  describe('Fallback function', async () => {
    it('should return invalid opcode', async () => {
      await expectInvalidOpcode(cryptoDollar.send(1 * ether), { from: sender })
    })
  })
})
