// const displayEther = (wei) => web3.fromWei(wei, 'ether').toNumber()
const displayNumber = (num) => num.toNumber()
const displayBytes = (bts) => bts.toString()
const displayAddress = (addr) => addr.toString()
const displayString = (str) => str

const displayFunctions = {
  'BuyCryptoDollar': {
    'queryId': displayBytes,
    'sender': displayAddress,
    'value': displayNumber,
    'oraclizeFee': displayNumber
  },
  'SellCryptoDollar': {
    'queryId': displayBytes,
    'sender': displayAddress,
    'tokenAmount': displayNumber,
    'oraclizeFee': displayNumber
  },
  'BuyCryptoDollarCallback': {
    'queryId': displayBytes,
    'result': displayString,
    'sender': displayAddress,
    'tokenAmount': displayNumber,
    'paymentValue': displayNumber
  },
  'SellCryptoDollarCallback': {
    'queryId': displayBytes,
    'result': displayString,
    'sender': displayAddress,
    'tokenAmount': displayNumber,
    'paymentValue': displayNumber
  },
  'SellUnpeggedCryptoDollarCallback': {
    'queryId': displayBytes,
    'result': displayString,
    'sender': displayAddress,
    'tokenAmount': displayNumber,
    'paymentValue': displayNumber
  }
}

const printRawEvents = (contract) => {
  let events = contract.allEvents()

  events.watch((error, result) => {
    if (error) {
      console.log('Error')
    } else {
      console.log(result)
    }
  })
}

const printEvents = (contract) => {
  let events = contract.allEvents()
  let key

  events.watch((error, result) => {
    if (error) {
      console.log('Error')
    } else {
      console.log(' ', result.event, ':')
      for (key in result.args) {
        if (result.event in displayFunctions && key in displayFunctions[result.event]) {
          console.log(' - ' + key + ': ' + displayFunctions[result.event][key].call(this, result.args[key]))
        } else {
          console.log(' - ' + key + ': ' + result.args[key])
        }
      }
    }
  })
}

const watchNextEvent = async(contract, blockNumber) => {
  let events
  let key
  let data = {}
  return new Promise(function (resolve, reject) {
    blockNumber ? events = contract.allEvents({ fromBlock: blockNumber }) : events = contract.allEvents()
    events.watch(function (error, result) {
      if (error) {
        reject(error)
      } else {
        for (key in result.args) {
          if (result.event in displayFunctions && key in displayFunctions[result.event]) {
            data[key] = displayFunctions[result.event][key].call(this, result.args[key])
          } else {
            data[key] = result.args[key]
          }
        }
        resolve(data)
      }
    })
  })
}

const watchContract = (contract, blockNumber) => {
  console.log(contract.address)
  const filter = web3.eth.filter({toBlock: 'latest', address: contract.address })
  filter.watch((err, res) => {
    if (err) {
      console.log(`Watch error: ${err}`)
    } else {
      console.log(res)
      web3.eth.getTransactionReceipt(res, (err, result) => {
        if (err) {
          console.log(`Transaction Receipt Error: ${err}`)
        }
        console.log(result)
      })
    }
  })
}

module.exports = {
  printRawEvents,
  printEvents,
  watchNextEvent,
  watchContract
}
