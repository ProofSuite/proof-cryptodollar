var Promise = require('bluebird');

import { gas, gasPrice, ether } from '../scripts/testConfig.js';
import { waitUntilTransactionsMined } from '../scripts/helper.js';

const transferOwnership = async (contract, sender, receiver) => {
    let params = {from: sender, gas: gas};
    let txn = await contract.transferOwnership(receiver, params);
    let txnReceipt = await waitUntilTransactionsMined(txn.tx);
}

const transferOwnerships = async (contracts, sender, receiver) => {
    let params = {from: sender, gas: gas};
    let promises = contracts.map(function(contract) { transferOwnership(contract, sender, receiver) });
    await Promise.all(promises);
}

const lockOwnership = async (contract, owner) => {
    let params = { from: owner, gas: gas };
    let txn = await contract.lockOwnership(owner, params);
    let txnReceipt = await waitUntilTransactionsMined(txn.tx);
}


module.exports = {
    transferOwnership,
    transferOwnerships,
    lockOwnership
}