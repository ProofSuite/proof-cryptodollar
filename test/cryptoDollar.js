import chai from 'chai'

chai.should()

const CryptoDollar = artifacts.require('./CryptoDollar.sol')

contract('CryptoDollar', (accounts) => {
  let cryptoDollar

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
})
