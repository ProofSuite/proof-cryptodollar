const request = require('request')

const threshold = 3

let rates = []
let ratesLength = 0
let ratesSum = 0
let sampleMean = 0
let standardDeviation = 0
let validRates = []
let validRatesLength = 0
let validRateSum = 0

function kraken () {
  return new Promise((resolve, reject) => {
    request('https://api.kraken.com/0/public/Ticker?pair=ETHUSD', function (err, response, body) {
      if (err) {
        resolve(0)
      } else {
        const bodyData = JSON.parse(body)
        resolve(parseFloat(bodyData.result.XETHZUSD.c[0]))
      }
    })
  })
}

function bitfinex () {
  return new Promise((resolve, reject) => {
    request('https://api.bitfinex.com/v1/pubticker/ethusd', function (err, response, body) {
      if (err) {
        resolve(0)
      } else {
        const bodyData = JSON.parse(body)
        resolve(parseFloat(bodyData.last_price))
      }
    })
  })
}

function gdax () {
  return new Promise((resolve, reject) => {
    const options = {
      uri: 'https://api.gdax.com/products/ETH-USD/ticker',
      method: 'GET',
      agent: false,
      headers: {
        'User-Agent': 'something'
      }
    }
    request(options, function (err, response, body) {
      if (err) {
        resolve(0)
      } else {
        const bodyData = JSON.parse(body)
        resolve(parseFloat(bodyData.price))
      }
    })
  })
}

function cryptoCompare () {
  return new Promise((resolve, reject) => {
    request('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', function (err, response, body) {
      if (err) {
        resolve(0)
      } else {
        const bodyData = JSON.parse(body)
        resolve(parseFloat(bodyData.USD))
      }
    })
  })
}

function bitStamp () {
  return new Promise((resolve, reject) => {
    request('https://www.bitstamp.net/api/v2/ticker/ethusd', function (err, response, body) {
      if (err) {
        resolve(0)
      } else {
        const bodyData = JSON.parse(body)
        resolve(parseFloat(bodyData.last))
      }
    })
  })
}

function gemini () {
  return new Promise((resolve, reject) => {
    request('https://api.gemini.com/v1/pubticker/ethusd', function (err, response, body) {
      if (err) {
        resolve(0)
      } else {
        const bodyData = JSON.parse(body)
        resolve(parseFloat(bodyData.last))
      }
    })
  })
}

function yobit () {
  return new Promise((resolve, reject) => {
    request('https://yobit.net/api/3/ticker/eth_usd', function (err, response, body) {
      if (err) {
        resolve(0)
      } else {
        const bodyData = JSON.parse(body)
        resolve(parseFloat(bodyData.eth_usd.last))
      }
    })
  })
}

async function getRates () {
  let rateList
  try {
    rateList = await Promise.all([
      kraken(),
      bitfinex(),
      gdax(),
      cryptoCompare(),
      bitStamp(),
      gemini(),
      yobit()
    ])
  } catch (err) {
  } finally {
    return rateList.filter(rate => rate > 0)
  }
}

function calculateStandardDeviation () { // calculate standard deviation
  return new Promise((resolve, reject) => {
    const sum = rates.reduce((acc, cur) => acc + Math.pow(cur - sampleMean, 2), 0)
    standardDeviation = Math.sqrt((1 / (ratesLength - 1)) * sum)
    resolve(standardDeviation)
  })
}

function findValidRates () { // find valid rates
  return new Promise((resolve, reject) => {
    validRates = rates.filter(rate => Math.abs(rate - sampleMean) <= standardDeviation)
    resolve(0)
  })
}

function findValidRatesMean () { // find valid rates mean
  return new Promise((resolve, reject) => {
    validRatesLength = validRates.length
    validRateSum = validRates.reduce((acc, cur) => acc + cur, 0)
    resolve(validRateSum / validRatesLength)
  })
}

async function calculateAverage (_rates) {
  try {
    rates = _rates
    ratesLength = rates.length
    ratesSum = rates.reduce((acc, cur) => acc + cur, 0)

    if (ratesLength > threshold && ratesSum !== 0) {
      sampleMean = ratesSum / ratesLength
      await calculateStandardDeviation()
      await findValidRates()
      const avgPrice = await findValidRatesMean()
      return avgPrice.toFixed(2)
    } else {
      return '0'
    }
  } catch (err) {
    return '0'
  }
}

function init () {
  rates = []
  ratesLength = 0
  ratesSum = 0
  sampleMean = 0
  standardDeviation = 0
  validRates = []
  validRatesLength = 0
  validRateSum = 0
}

function getSampleMean () {
  return sampleMean
}

function getStandardDeviation () {
  return standardDeviation
}

function getValidRates () {
  return validRates
}

module.exports = {
  init: init,
  getRates: getRates,
  calculateAverage : calculateAverage,
  getSampleMean : getSampleMean,
  getStandardDeviation : getStandardDeviation,
  getValidRates: getValidRates
}
