require('../scripts/utilities.js')
const h = require('../scripts/helper.js')

import { gas, gasPrice } from '../scripts/testConfig.js'

const getBufferFee = (value) => { return value / 200 }
const applyFee = (value, fee) => { return value * (1 - fee) }
const getFee = (value, fee) => { return value * fee }

const getTotalSupply = async (token) => {
  let tokenSupply = await token.totalSupply.call()
  return tokenSupply.toNumber()
}

const getCUSDBalance = async (contract, investor1) => {
  let balance = await contract.CUSDBalance(investor1)
  return balance.toNumber()
}

const getCEURBalance = async (contract, investor1) => {
  let balance = await contract.CEURBalance(investor1)
  return balance.toNumber()
}

const getBalance = (address) => {
  let balance = web3.eth.getBalance(address)
  return Number(balance.toString())
}

const getBalances = (addresses) => {
  let balances = []
  addresses.map(function (address) { balances.push(getBalance(address)) })
  return balances
}

const getEtherBalance = (address) => {
  let balance = web3.fromWei('ether', web3.eth.getBalance(address))
  return balance.toNumber()
}

const getEtherBalances = (addresses) => {
  let balances = []
  addresses.map(function (address) { balances.push(getEtherBalance(address)) })
  return balances
}

const OrderCUSD = async (contract, txnObj) => {
  let txn = await contract.buyCUSDTokens(txnObj)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const OrderCEUR = async (contract, txnObj) => {
  let txn = await contract.buyCEURTokens(txnObj)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const sellOrderCUSD = async (contract, tokenNumber, seller) => {
  let params = { from: seller, gas: gas, gasPrice: gasPrice }
  let txn = await contract.sellCUSDTokens(tokenNumber, params)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const sellOrderCEUR = async (contract, tokenNumber, seller) => {
  let params = { from: seller, gas: gas, gasPrice: gasPrice }
  let txn = await contract.sellCEURTokens(tokenNumber, params)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const sellUnpeggedOrderCUSD = async(contract, tokenNumber, seller) => {
  let params = { from: seller, gas: gas, gasPrice: gasPrice }
  let txn = await contract.sellUnpeggedCUSD(tokenNumber, params)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const sellUnpeggedOrderCEUR = async(contract, tokenNumber, seller) => {
  let params = { from: seller, gas: gas, gasPrice: gasPrice }
  let txn = await contract.sellUnpeggedCEUR(tokenNumber, params)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const mintToken = async(contract, minter, amount) => {
  let params = { from: minter, gas: gas, gasPrice: gasPrice }
  let txn = await contract.mint(minter, amount, params)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const transferToken = async(contract, sender, receiver, amount) => {
  let params = { from: sender, gas: gas, gasPrice: gasPrice }
  let txn = await contract.transfer(receiver, amount, params)
  let txnReceipt = await h.waitUntilTransactionsMined(txn.tx)
  return txnReceipt
}

const transferTokens = async(token, sender, receiver, amount) => {
  let promises = token.map(function (oneToken) { transferTokens(oneToken, sender, receiver, amount) })
  let txnReceipts = await Promise.all(promises)

  return txnReceipts
}

const getBuffer = async (cryptoFiat) => {
  let balance = await cryptoFiat.buffer.call()
  return Number(balance)
}

const getBufferInEther = async (cryptoFiat) => {
  let balance = await cryptoFiat.buffer.call()
  balance = Number(balance).toEther()
  return balance
}

const getDividends = async (cryptoFiat) => {
  let balance = await cryptoFiat.dividends.call()
  return Number(balance)
}

const getDividendsInEther = async (cryptoFiat) => {
  let balance = await cryptoFiat.dividends.call()
  balance = Number(balance).toEther()
  return balance
}

const getTotalCUSDSupply = async(cryptoFiat) => {
  let supply = await cryptoFiat.CUSDTotalSupply.call()
  return Number(supply)
}

const getTotalCEURSupply = async(cryptoFiat) => {
  let supply = await cryptoFiat.CEURTotalSupply.call()
  return Number(supply)
}

const getTotalCryptoFiatValue = async(cryptoFiat) => {
  let balance = await cryptoFiat.totalCryptoFiatValue.call()
  balance = balance.toNumber()
  return balance
}

const getUSDConversionRate = async(cryptoFiat) => {
  let conversionRates = await cryptoFiat.conversionRate.call()
  return Number(conversionRates[0])
}

const getEURConversionRate = async(cryptoFiat) => {
  let conversionRates = await cryptoFiat.conversionRate.call()
  return Number(conversionRates[1])
}

const setUSDConversionRate = async(cryptoFiat, value) => {
  let txn = await cryptoFiat.setUSDConversionRate(value, { from: web3.eth.accounts[0], gas: gas, gasPrice: gasPrice })
  await h.waitUntilTransactionsMined(txn.tx)
}

const setEURConversionRate = async(cryptoFiat, value) => {
  let txn = await cryptoFiat.setEURConversionRate(value, { from: web3.eth.accounts[0], gas: gas, gasPrice: gasPrice })
  await h.waitUntilTransactionsMined(txn.tx)
}

const getReservedEther = async(token, investor) => {
  let reservedEther = await token.reservedEther(investor)
  return Number(reservedEther)
}

const setConversionRate = async(contract, currency, value) => {
  if (currency == 'USD') {
    let txn = await contract.setUSDConversionRate(value, { from: web3.eth.accounts[0], gas: gas, gasPrice: gasPrice })
    await h.waitUntilTransactionsMined(txn.tx)
  } else if (currency == 'EUR') {
    let txn = await contract.setEURConversionRate(value, { from: web3.eth.accounts[0], gas: gas, gasPrice: gasPrice })
    await h.waitUntilTransactionsMined(txn.tx)
  } else {
    return -1
  }
}

const getConversionRate = async(contract, currency) => {
  let rates = await contract.conversionRate.call()
  if (currency === 'USD') {
    return Number(rates[0])
  } else if (currency === 'EUR') {
    return Number(rates[1])
  }
}

const getState = async(cryptoFiat) => {
  let currentStateID = await cryptoFiat.currentState.call()
  if (currentStateID === 1) {
    return 'UNPEGGED'
  } else {
    return 'PEGGED'
  }
}

module.exports = {
  getDividends,
  getDividendsInEther,
  getBalance,
  getBuffer,
  getBufferInEther,
  getTotalCUSDSupply,
  getTotalCEURSupply,
  getTotalSupply,
  getTotalCryptoFiatValue,
  getCUSDBalance,
  getCEURBalance,
  getReservedEther,
  OrderCEUR,
  OrderCUSD,
  sellOrderCEUR,
  sellOrderCUSD,
  sellUnpeggedOrderCEUR,
  sellUnpeggedOrderCUSD,
  getEURConversionRate,
  getUSDConversionRate,
  setUSDConversionRate,
  setEURConversionRate,
  getState,
  getBufferFee,
  getFee,
  applyFee,
  mintToken,
  transferToken,
  transferTokens,
  getConversionRate,
  setConversionRate,
  getBalances,
  getEtherBalances,
  getEtherBalance
}

