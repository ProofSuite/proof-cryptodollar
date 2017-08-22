// import { gas,
//     gasPrice,
//     ether,
//     investment,
//     defaultUSDConversionRate,
//     defaultEURConversionRate } from '../scripts/testConfig.js';

// import { getDividends,
//     getBalance,
//     getBuffer,
//     getTotalCUSDSupply,
//     getTotalCEURSupply,
//     getTotalSupply,
//     getTotalCryptoFiatValue,
//     getCUSDBalance,
//     getCEURBalance,
//     OrderCEUR,
//     OrderCUSD,
//     sellOrderCEUR,
//     sellOrderCUSD,
//     sellUnpeggedOrderCEUR,
//     sellUnpeggedOrderCUSD,
//     getUSDConversionRate,
//     getEURConversionRate,
//     setUSDConversionRate,
//     setEURConversionRate,
//     getState,
//     getFee,
//     getBufferFee,
//     applyFee } from '../scripts/cryptoFiatHelpers.js';


// const h = require('../scripts/helper.js');

// const BigNumber = web3.BigNumber

// let chai = require('chai');
// var chaiAsPromised = require('chai-as-promised');
// var chaiStats = require('chai-stats');
// var chaiBigNumber = require('chai-bignumber')(BigNumber);
// chai.use(chaiAsPromised).use(chaiBigNumber).use(chaiStats).should();

// const assert = chai.assert;
// const should = chai.should();
// const expect = chai.expect;

// const SafeMath = artifacts.require('./SafeMath.sol');
// const Ownable = artifacts.require('./Ownable.sol');
// const Pausable = artifacts.require('./Pausable.sol');
// const CryptoFiat = artifacts.require('./CryptoFiat.sol');
// const CryptoEuroToken = artifacts.require('./CEURToken.sol');
// const CryptoDollarToken = artifacts.require('./CUSDToken.sol');



// contract('CryptoFiat', (accounts) => {

//     let cryptoFiat;
//     let CEURTokenAddress;
//     let CUSDTokenAddress;
//     let CEURToken;
//     let CUSDToken;
//     let defaultOrder;
//     let ETH_EUR;
//     let ETH_USD;
//     let logs = [];
//     let events;
//     const investor1 = accounts[1];
//     const investor2 = accounts[2];
//     const market = accounts[3];

//     before(async function() {

//         cryptoFiat = await CryptoFiat.new();
//         CEURTokenAddress = await cryptoFiat.CEUR();
//         CUSDTokenAddress = await cryptoFiat.CUSD();
//         CEURToken = CryptoEuroToken.at(CEURTokenAddress);
//         CUSDToken = CryptoDollarToken.at(CUSDTokenAddress);

//     })


//     after(function() {
//         events = cryptoFiat.allEvents({fromBlock: 0, toBlock: 'latest'});
//         events.get(function(error,result) {
//             let i = 0;
//             let j = 0;
//             result.forEach(function(log) {
//                 console.log(i++ + ". " + log.event + ": ");
//                 Object.keys(log.args).forEach(function(key) {
//                     console.log(key + ": " + log.args[key].toString());
//                 });
//                 console.log("\n");
//             });
//         });
//     });