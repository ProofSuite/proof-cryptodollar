const chai = require('chai')
const should = chai.should()
const computation = require('../computation-script/computation')

describe('Average Price Test', async () => {
  describe('If the number of received rates is above the threshold', async () => {
    it('averagePrice should be 866.38 for rates [864.09, 866.16, 867.3, 867.06, 863.82, 869.87, 894.50]', async () => {
      const inputRates = [864.09, 866.16, 867.30, 867.06, 863.82, 869.87, 894.50]
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('866.38')
    })

    it('averagePrice should be 866.84 for rates [844.09, 866.16, 867.30, 867.06, 863.82, 869.87, 894.50]', async () => {
      const inputRates = [844.09, 866.16, 867.30, 867.06, 863.82, 869.87, 894.50]
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('866.84')
    })

    it('averagePrice should be 867.78 for rates [844.09, 866.16, 867.30, 869.87]', async () => {
      const inputRates = [844.09, 866.16, 867.30, 869.87]
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('867.78')
    })
  })

  describe('If the number of received rates is under the threshold', async () => {
    it('should return 0 for rates [864.09]', async () => {
      const inputRates = [864.09]
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('0')
    })

    it('should return 0 for rates [864.09, 866.16]', async () => {
      const inputRates = [864.09, 866.16]
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('0')
    })

    it('should return 0 for rates [864.09, 866.16, 867.30]', async () => {
      const inputRates = [864.09, 866.16, 867.30]
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('0')
    })
  })

  describe('If no rates are available', async () => {
    it('should return 0 for an empty list of rates', async () => {
      const inputRates = []
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('0')
    })
  })
})
