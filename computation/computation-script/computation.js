const request = require('request')

const THRESHOLD = 3

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

async function calculateAverage (rates) {
  try {
    const ratesSum = rates.reduce((acc, cur) => acc + cur, 0)

    if (rates.length > THRESHOLD && ratesSum !== 0) {
      const sampleMean = ratesSum / rates.length
      const standardDeviation = Math.sqrt((1 / (rates.length - 1)) * rates.reduce((acc, cur) => acc + Math.pow(cur - sampleMean, 2), 0))
      const validRates = rates.filter(rate => Math.abs(rate - sampleMean) <= standardDeviation)
      const averagePrice = validRates.reduce((acc, cur) => acc + cur, 0) / validRates.length
      const averagePriceInCents = (averagePrice * 100).toFixed(0)
      return averagePriceInCents
    } else {
      return '0'
    }
  } catch (err) {
    return '0'
  }
}

module.exports = {
  getRates: getRates,
  calculateAverage : calculateAverage
}
