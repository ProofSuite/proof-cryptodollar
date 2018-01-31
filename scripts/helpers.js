var Promise = require('bluebird')

const waitUntilTransactionsMined = (txnHashes) => {
  var transactionReceiptAsync
  const interval = 500
  transactionReceiptAsync = (txnHashes, resolve, reject) => {
    try {
      var receipt = web3.eth.getTransactionReceipt(txnHashes)
      if (receipt == null) {
        setTimeout(() => {
          transactionReceiptAsync(txnHashes, resolve, reject)
        }, interval)
      } else {
        resolve(receipt)
      }
    } catch (e) {
      reject(e)
    }
  }

  if (Array.isArray(txnHashes)) {
    var promises = []
    txnHashes.forEach((txHash) => {
      promises.push(waitUntilTransactionsMined(txHash))
    })
    return Promise.all(promises)
  }    else {
    return new Promise(function (resolve, reject) { transactionReceiptAsync(txnHashes, resolve, reject)})
  }
}

const getBalance = (address) => {
  let balance = web3.eth.getBalance(address)
  return balance.toNumber()
}

const getBalances = (addresses) => {
  let balances = []
  addresses.map(function (address) { balances.push(getBalance(address)) })
  return balances
}

const getEtherBalance = (address) => {
  let balance = web3.fromWei(web3.eth.getBalance(address), 'ether')
  return balance.toNumber()
}

const getEtherBalances = (addresses) => {
  let balances = []
  addresses.forEach(function (address) { balances.push(getEtherBalance(address)) })
  return balances
}

const inEther = (amountInWei) => {
  let amount = web3.fromWei(amountInWei, 'ether')
  return Number(amount)
}

const inWei = (amountInEther) => {
  let amount = web3.toWei(amountInEther, 'ether')
  return amount.toNumber()
}

// in our case the base units are cents
const inBaseUnits = (tokens) => {
  return tokens * (10 ** 2)
}

const inCents = (tokens) => {
  return tokens * (10 ** 2)
}

const inTokenUnits = (tokenBaseUnits) => {
  return tokenBaseUnits / (10 ** 18)
}

const deployContracts = async (contracts) => {
  let results = await Promise.map(contracts, function (contract) {
    return contract.new()
  })

  return results
}

const getAddresses = async (contracts) => {
  let addresses = contracts.map(function (contract) {
    return contract.address
  })
  return addresses
}

module.exports = {
  waitUntilTransactionsMined,
  getBalance,
  getBalances,
  getEtherBalance,
  getEtherBalances,
  inEther,
  inWei,
  inBaseUnits,
  inTokenUnits,
  inCents,
  deployContracts,
  getAddresses
}

