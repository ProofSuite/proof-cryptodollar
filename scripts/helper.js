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

const getBufferFee = (value) => { return value / 200; }
const applyFee = (value, fee) => { return value * (1-fee)}
const getFee = (value, fee) => { return value * fee }

const getTotalSupply = async (token) => { 
    let tokenSupply = await token.totalSupply.call();
    return tokenSupply.toNumber();
 }

const getTotalProofTokenHolders = async (contract) => {
    let balance = await contract.contractBalance.call();
    return balance[0].toNumber();
}

const getTotalCryptoTokenHolders = async (contract) => {
    let balance = await contract.contractBalance.call();
    return balance[1].toNumber();
}

const getCUSDBalance = async (contract, investor1) => {
    let balance = await contract.CUSDBalance(investor1);
    return balance.toNumber();
}

const getCEURBalance = async (contract, investor1) => {
    let balance = await contract.CEURBalance(investor1);
    return balance.toNumber();
}

const getBalance = (investor1) => {
    let balance = web3.eth.getBalance(investor1);
    return Number(balance.toString());
}

const OrderCUSD = async (contract, txnObj) => {
    let txn = await contract.buyCUSDTokens(txnObj);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const OrderCEUR = async (contract, txnObj) => {
    let txn = await contract.buyCEURTokens(txnObj);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const sellOrderCUSD = async (contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellCUSDTokens(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const sellOrderCEUR = async (contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellCEURTokens(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const sellUnpeggedOrderCUSD = async(contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellUnpeggedCUSD(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const sellUnpeggedOrderCEUR = async(contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellUnpeggedCEUR(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const getBuffer = async (cryptoFiat) => {
    let balance = await cryptoFiat.buffer.call();
    return Number(balance);
}

const getDividends = async (cryptoFiat) => {
    let balance = await cryptoFiat.dividends.call();
    return Number(balance);
}

const getTotalCUSDSupply = async(cryptoFiat) => {
    let supply = await cryptoFiat.CUSDTotalSupply.call();
    return Number(supply);
}

const getTotalCEURSupply = async(cryptoFiat) => {
    let supply = await cryptoFiat.CEURTotalSupply.call();
    return Number(supply);
}

const getTotalCryptoFiatValue = async(cryptoFiat) => {
    let balance = await cryptoFiat.totalCryptoFiatValue.call();
    return balance = balance.toNumber();
}

const getUSDConversionRate = async(cryptoFiat) => {
    let conversionRates = await cryptoFiat.conversionRate.call();
    return Number(conversionRates[0]);
}

const getEURConversionRate = async(cryptoFiat) => {
    let conversionRates = await cryptoFiat.conversionRate.call();
    return Number(conversionRates[1]);
}

const setUSDConversionRate = async(cryptoFiat, value) => {
    let txn = await cryptoFiat.setUSDConversionRate(value, {from: web3.eth.accounts[0], gas: gas, gasPrice: gasPrice });
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const setEURConversionRate = async(cryptoFiat, value) => {
    let txn = await cryptoFiat.setEURConversionRate(value, {from: web3.eth.accounts[0], gas: gas, gasPrice: gasPrice });
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
}

const getState = async(cryptoFiat) => {
    let currentStateID = await cryptoFiat.currentState.call();
    if (currentStateID == 1) {
        return "UNPEGGED";
    } else {
        return "PEGGED";
    }
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

