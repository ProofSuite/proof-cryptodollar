var computation = require('./computation')

async function getAveragePrice () {
  try {
    const nonZeroRates = await computation.getRates()
    const averagePrice = await computation.calculateAverage(nonZeroRates)
    console.log(averagePrice)
  } catch (err) {
    console.log('0')
  }
}

getAveragePrice()
