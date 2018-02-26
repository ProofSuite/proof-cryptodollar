const chai = require('chai')
const should = chai.should()
const computation = require('../computation-script/computation')


describe('Average Price Test', async () => {
  describe('If the number of received rates is above the threshold', async () => {
    beforeEach(function () {
      computation.init()
    })

    describe('', async () => {
      let inputRates1 = [864.09, 866.16, 867.30, 867.06, 863.82, 869.87, 894.50]
      it('averagePrice should be 866.38 for rates [864.09, 866.16, 867.3, 867.06, 863.82, 869.87, 894.50]', async () => {
        const averagePrice = await computation.calculateAverage(inputRates1)
        const sampleMean = computation.getSampleMean()
        const standardDeviation = computation.getStandardDeviation()
        const validRates = computation.getValidRates()

        sampleMean.should.equal(870.4)
        standardDeviation.should.equal(10.823944136342659)
        validRates.should.not.include(894.50)
        averagePrice.should.equal('866.38')
      })
    })

    describe('', async () => {
      let inputRates2 = [844.09, 866.16, 867.30, 867.06, 863.82, 869.87, 894.50]
      it('averagePrice should be 866.84 for rates [844.09, 866.16, 867.30, 867.06, 863.82, 869.87, 894.50]', async () => {
        const averagePrice = await computation.calculateAverage(inputRates2)
        const sampleMean = computation.getSampleMean()
        const standardDeviation = computation.getStandardDeviation()
        const validRates = computation.getValidRates()

        sampleMean.should.equal(867.5428571428572)
        standardDeviation.should.equal(14.70942862507549)
        validRates.should.not.include(844.09)
        validRates.should.not.include(894.50)
        averagePrice.should.equal('866.84')
      })
    })

    describe('', async () => {
      let inputRates3 = [844.09, 866.16, 867.30, 869.87]
      it('averagePrice should be 867.78 for rates [844.09, 866.16, 867.30, 869.87]', async () => {
        const averagePrice = await computation.calculateAverage(inputRates3)
        const sampleMean = computation.getSampleMean()
        const standardDeviation = computation.getStandardDeviation()
        const validRates = computation.getValidRates()

        sampleMean.should.equal(861.855)
        standardDeviation.should.equal(11.94454547760885)
        validRates.should.not.include(844.09)
        averagePrice.should.equal('867.78')
      })
    })

  })

  describe('If the number of received rates is under the threshold', async () => {
    beforeEach(function () {
      computation.init()
    })

    describe('', async () => {
      let inputRates1 = [864.09]
      it('should return 0 for rates [864.09]', async () => {
        const averagePrice = await computation.calculateAverage(inputRates1)
        averagePrice.should.equal('0')
      })
    })

    describe('', async () => {
      let inputRates2 = [864.09, 866.16]
      it('should return 0 for rates [864.09, 866.16]', async () => {
        const averagePrice = await computation.calculateAverage(inputRates2)
        averagePrice.should.equal('0')
      })
    })

    describe('', async () => {
      let inputRates3 = [864.09, 866.16, 867.30]
      it('should return 0 for rates [864.09, 866.16, 867.30]', async () => {
        const averagePrice = await computation.calculateAverage(inputRates3)
        averagePrice.should.equal('0')
      })
    })
  })

  describe('If no rates are available', async () => {
    let inputRates = []
    it('should return 0 for rates []', async () => {
      const averagePrice = await computation.calculateAverage(inputRates)
      averagePrice.should.equal('0')
    })
  })
})
