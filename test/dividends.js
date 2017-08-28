
const BigNumber = web3.BigNumber
let chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiStats = require('chai-stats');
var chaiBigNumber = require('chai-bignumber')(BigNumber);
chai.use(chaiAsPromised).use(chaiBigNumber).use(chaiStats).should();

import { gas,
         gasPrice,
         ether,
         investment,
         defaultUSDConversionRate,
         defaultEURConversionRat,
         tokenUnits } from '../scripts/testConfig.js';

import { getDividends,
         getTotalSupply,
         OrderCEUR,
         OrderCUSD,
         sellOrderCEUR,
         sellOrderCUSD,
         sellUnpeggedOrderCEUR,
         getState,
         getFee,
         applyFee,
         mintToken,
         transferToken } from '../scripts/cryptoFiatHelpers.js';

import { getBalance,
         getEtherBalance,
         getBalances,
         getEtherBalances,
         waitUntilTransactionsMined,
         inEther,
         inWei,
         deployContracts,
         getAddresses } from '../scripts/helper.js';

import { transferOwnership,
         transferOwnerships } from '../scripts/ownershipHelpers.js';


const assert = chai.assert;
const should = chai.should();
const expect = chai.expect;
const CryptoFiat = artifacts.require('./CryptoFiat.sol');
const CryptoEuroToken = artifacts.require('./CEURToken.sol');
const CryptoDollarToken = artifacts.require('./CUSDToken.sol');
const ProofToken = artifacts.require('./ProofToken.sol');


contract('CryptoFiat', (accounts) => {

    let cryptoFiat;
    let txn;
    let txnReceipt;
    let defaultOrder;

    let PRFTAddress;
    let CEURAddress;
    let CUSDAddress;
    let cryptoFiatAddress;

    let proofToken;
    let CEURToken;
    let CUSDToken;

    let ETH_EUR;
    let ETH_USD;
    let logs;
    let events;

    const fund = accounts[0];
    let investors;

    before(async function() {

        const deployedTokens = await deployContracts([CryptoDollarToken, CryptoEuroToken, ProofToken]);
        [CUSDToken, CEURToken, proofToken] = deployedTokens;
        const tokenAddresses = await getAddresses(deployedTokens);
        [CUSDAddress, CEURAddress, PRFTAddress] = tokenAddresses;

        cryptoFiat = await CryptoFiat.new(CUSDAddress, CEURAddress, PRFTAddress);
        cryptoFiatAddress = cryptoFiat.address;

        defaultOrder = {from: fund, value: 200 * ether, gas: 200000 };
        txn = {from: fund, gas: 200000};

        await transferOwnerships([CEURToken, CUSDToken, proofToken], accounts[0], cryptoFiatAddress);

    });

    // afterEach(function() {
    //     events = cryptoFiat.allEvents({fromBlock: 0, toBlock: 'latest'});
    //     events.get(function(error,result) {
    //         let i = 0;
    //         let j = 0;
    //         result.forEach(function(log) {
    //             console.log(i++ + ". " + log.event + ": ");
    //             Object.keys(log.args).forEach(function(key) {
    //                 console.log(key + ": " + log.args[key].toString());
    //             });
    //             console.log("\n");
    //         });
    //     });
    // });


    describe('Initial State', function() {

        it('should have initial dividends equal to 0', async function() {
            let dividends = await getDividends(cryptoFiat)
            dividends.should.be.equal(0);
        });

    });


    describe('Dividend Pool', function() {

        beforeEach(async function() {

            const deployedTokens = await deployContracts([CryptoDollarToken, CryptoEuroToken, ProofToken]);
            [CUSDToken, CEURToken, proofToken] = deployedTokens;
            const tokenAddresses = await getAddresses(deployedTokens);
            [CUSDAddress, CEURAddress, PRFTAddress] = tokenAddresses;
    
            cryptoFiat = await CryptoFiat.new(CUSDAddress, CEURAddress, PRFTAddress);
            cryptoFiatAddress = cryptoFiat.address;

            await transferOwnerships([CEURToken, CUSDToken, proofToken], accounts[0], cryptoFiatAddress);
            await mintToken(proofToken, fund, 100 * tokenUnits);

            let users = accounts.slice(1,3); //get two accounts
            await transferToken(proofToken, fund, users[0], 100 * tokenUnits);
            let balance = await balance;

        });

        it('should increase the dividends pool by 0.5% of investment value', async function() {
            
            let initialDividends = await getDividends(cryptoFiat);
            let expectedDividends = initialDividends + getFee(200 * ether, 0.005);

            await OrderCUSD(cryptoFiat, defaultOrder);
            
            let dividends = await getDividends(cryptoFiat);
            dividends.should.be.bignumber.equal(expectedDividends);
            
        });

        it('should initially empty', async function() {

            let dividends = await getDividends(cryptoFiat);
            dividends.should.be.bignumber.equal(0);

        });

    });


    describe('Dividend Payout', function() {

        beforeEach(async function() {

            const deployedTokens = await deployContracts([CryptoDollarToken, CryptoEuroToken, ProofToken]);
            [CUSDToken, CEURToken, proofToken] = deployedTokens;
            const tokenAddresses = await getAddresses(deployedTokens);
            [CUSDAddress, CEURAddress, PRFTAddress] = tokenAddresses;
    
            cryptoFiat = await CryptoFiat.new(CUSDAddress, CEURAddress, PRFTAddress);
            cryptoFiatAddress = cryptoFiat.address;

            await transferOwnerships([CEURToken, CUSDToken, proofToken], accounts[0], cryptoFiatAddress);
            await mintToken(proofToken, fund, 100 * tokenUnits);
            await OrderCUSD(cryptoFiat, defaultOrder);

        });

        it('should send 50% of total dividends if investor holds 50% of the tokens', async function() {
            
            let users = accounts.slice(1,3); //get two accounts
            await transferToken(proofToken, fund, users[0], 50 * tokenUnits);
            await transferToken(proofToken, fund, users[1], 50 * tokenUnits);

            let initialUserBalances = getBalances(users);
            let initialTotalDividends = await getDividends(cryptoFiat);
            let expectedDividends = initialTotalDividends / 2;

            await cryptoFiat.withdrawDividends({from: users[0], gas: gas});
            await cryptoFiat.withdrawDividends({from: users[1], gas: gas});

            let totalDividends = await getDividends(cryptoFiat);
            totalDividends.should.be.equal(0);
            
            let userBalances = getBalances(users);
            userBalances[0].should.be.equal(initialUserBalances[0] + expectedDividends);
            userBalances[1].should.be.equal(initialUserBalances[1] + expectedDividends);

        });

        it('should send 25% of total dividends if investor holds 25% of the tokens', async function() {

            let users = accounts.slice(1,3); //get two accounts
            
            await proofToken.mint(users[0], fund, users[0], 100 * tokenUnits);
            await proofToken.mint(users[1], fund, users[1], 300 * tokenUnits);

            let initialUserBalances = getBalances(users);
            let initialTotalDividends = await getDividends(cryptoFiat);
            let expectedDividends = [ initialTotalDividends / 4, initialTotalDividends * (3 / 4) ];

            await cryptoFiat.withdrawDividends({from: users[0], gas: gas });
            await cryptoFiat.withdrawDividends({from: users[1], gas: gas });

            let userBalances = getBalances(users);

            userBalances.forEeach(function(balance, i) { 
                balance.should.be.equal(initialUserBalance[i] + expectedDividends[i]);
            });

        });

    });


});