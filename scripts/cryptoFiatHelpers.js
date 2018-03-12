/* global  web3: true */

const getBufferFee = (value) => { return value / 200 }

const applyFee = (value, fee) => { return value * (1 - fee) }

const getFee = (value, fee) => { return value * fee }

const getOrderEtherValue = (value) => { return web3.fromWei(value - getFee(value, 0.01)) }

const getOrderWeiValue = (value) => { return (value - getFee(value, 0.01)) }

const getState = async(cryptoFiat, exchangeRate) => {
  let isPegged = await cryptoFiat.inState(0, exchangeRate)
  return (isPegged ? 'PEGGED' : 'UNPEGGED')
}

module.exports = {
  getBufferFee,
  applyFee,
  getFee,
  getOrderEtherValue,
  getOrderWeiValue,
  getState
}
