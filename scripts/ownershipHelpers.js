import { gas, gasPrice, ether } from '../scripts/testConfig.js';
import { waitUntilTransactionsMined } from '../scripts/helper.js';

const transferOwnership = async (contract, sender, receiver) => {
    let params = {from: sender, gas: gas};
    let txn = await contract.transferOwnership(receiver, params);
    let txnReceipt = await waitUntilTransactionsMined(txn.tx);
}

const lockOwnership = async (contract, owner) => {
    let params = { from: owner, gas: gas };
    let txn = await contract.lockOwnership(owner, params);
    let txnReceipt = await waitUntilTransactionsMined(txn.tx);
}


module.exports = {
    transferOwnership,
    lockOwnership
}