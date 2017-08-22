let chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const expect = chai.expect;
chai.should();
chai.use(chaiAsPromised);


const waitUntilTransactionsMined = (txn_hashes) => {
    var transactionReceiptAsync;
    const interval = 500;
    transactionReceiptAsync = function(txn_hashes, resolve, reject) {
        try {
            var receipt = web3.eth.getTransactionReceipt(txn_hashes);
            if (receipt == null) {
                setTimeout(function () {
                    transactionReceiptAsync(txn_hashes, resolve, reject);
                }, interval);
            } else {
                resolve(receipt);
            }
        } catch(e) {
            reject(e);
        }
    };
    
    if (Array.isArray(txn_hashes)) {
        var promises = [];
        txn_hashes.forEach(function (tx_hash) {
            promises.push(waitUntilTransactionsMined(tx_hash));
        });
        return Promise.all(promises);
    } 
    else {
        return new Promise(function (resolve, reject) {transactionReceiptAsync(txn_hashes, resolve, reject);});
    }
}

const getBalance = (address) => {
  return web3.fromWei(web3.eth.getBalance(address).toString(), 'ether');
}

const getBalanceInWei = (address) => {
    return Number(web3.eth.getBalance(address).toString());
}

const inEther = (amountInWei) => {
  return web3.fromWei(amountInWei, 'ether');
}

const inWei = (amountInEther) => {
  return web3.toWei(amountInEther, 'ether');
}

// in our case the base units are cents
const inBaseUnits = (tokens) => {
  return tokens * (10 ** 2);
}

const inCents = (tokens) => {
    return tokens * (10 ** 2);
}

const inTokenUnits = (tokenBaseUnits) => {
  return tokenBaseUnits / (10 ** 18);
}


module.exports = {
  waitUntilTransactionsMined,
  getBalance,
  getBalanceInWei,
  inEther,
  inWei,
  inBaseUnits,
  inTokenUnits,
  inCents
}

