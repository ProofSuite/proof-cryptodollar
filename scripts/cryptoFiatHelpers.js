/* global  web3: true */
const getBufferFee = (value) => { return value / 200 }
const applyFee = (value, fee) => { return value * (1 - fee) }

const getFee = (value, fee) => { return value * fee }
const getOrderEtherValue = (value) => { return web3.fromWei(value - getFee(value, 0.01)) }
const getOrderWeiValue = (value) => { return (value - getFee(value, 0.01)) }

const getState = async(cryptoFiat) => {
  let currentStateID = await cryptoFiat.currentState.call()
  if (currentStateID.eq(1)) {
    return 'UNPEGGED'
  } else {
    return 'PEGGED'
  }
}

module.exports = {
  getBufferFee,
  applyFee,
  getFee,
  getOrderEtherValue,
  getOrderWeiValue,
  getState
}
