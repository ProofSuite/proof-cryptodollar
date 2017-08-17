const SafeMath = artifacts.require('./SafeMath.sol')
const Ownable = artifacts.require('./Ownable.sol')
const Pausable = artifacts.require('./Pausable.sol')
const CryptoFiat = artifacts.require('./CryptoFiat.sol')
const CryptoEuroToken = artifacts.require('./CEURToken.sol')
const CryptoDollarToken = artifacts.require('./CUSDToken.sol')

const h = require('../scripts/helper.js');
const BigNumber = web3.BigNumber


let chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiStats = require('chai-stats');
var chaiBigNumber = require('chai-bignumber')(BigNumber);
chai.use(chaiAsPromised).use(chaiBigNumber).use(chaiStats).should();

const assert = chai.assert;
const should = chai.should();
const expect = chai.expect;

let gas = 3*10**6;
let gasPrice = 6*10**9;

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

const getCUSDBalance = async (contract, investor) => {
    let balance = await contract.CUSDBalance(investor);
    return balance.toNumber();
}

const getCEURBalance = async (contract, investor) => {
    let balance = await contract.CEURBalance(investor);
    return balance.toNumber();
}

const getBalance = (investor) => {
    let balance = web3.eth.getBalance(investor);
    return Number(balance.toString());
}

const OrderCUSD = async (contract, txnObj) => {
    let txn = await contract.buyCUSDTokens(txnObj);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    return txnReceipt;
}

const OrderCEUR = async (contract, txnObj) => {
    let txn = await contract.buyCEURTokens(txnObj);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    return txnReceipt;
}

const sellOrderCUSD = async (contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellCUSDTokens(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    return txnReceipt;
}

const sellOrderCEUR = async (contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellCEURTokens(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    return txnReceipt;
}

const sellUnpeggedOrderCUSD = async(contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellUnpeggedCUSD(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    return txnReceipt;
}

const sellUnpeggedOrderCEUR = async(contract, tokenNumber, seller) => {
    let params = {from: seller, gas: gas, gasPrice: gasPrice };
    let txn = await contract.sellUnpeggedCEUR(tokenNumber, params);
    let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    return txnReceipt;
}

const getBuffer = async (cryptoFiat) => {
    let balance = await cryptoFiat.buffer.call();
    return Number(balance);
}

const getBigNumberBuffer = async (cryptoFiat) => {
    await cryptoFiat.buffer.call();
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

const getReservedEther = async(token, investor) => {
    let reservedEther = await token.reservedEther(investor);
    return Number(reservedEther);
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




contract('CryptoFiat', (accounts) => {
    
    let cryptoFiat;
    let ether = 10 ** 18;
    let CEURTokenAddress;
    let CUSDTokenAddress;
    let CEURToken;
    let CUSDToken;
    let txn;
    let txnReceipt;
    let params;
    let ETH_USD_InCents = 25000;
    let ETH_EUR_InCents = 20000;
    let ETH_USD_Rate = ETH_USD_InCents / (10 ** 2);
    let ETH_EUR_Rate = ETH_USD_InCents / (10 ** 2);
    let ETH_EUR;
    let ETH_USD;
    
    let tokenUnits = 10;
    let tokenAmount = h.inCents(500);
    let euroConversionRate;
    let dollarConversionRate;
    let logs = [];
    let events;

    const investment = 1 * ether;
    const buyAmount = 1 * ether;
    const investor = accounts[1];
    const investor2 = accounts[2];
    const market = accounts[3];

    // after(function() {
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

    describe('Sell Unpegged Tokens', function() {


        beforeEach(async function() {

            cryptoFiat = await CryptoFiat.new();
            CEURTokenAddress = await cryptoFiat.CEUR();
            CUSDTokenAddress = await cryptoFiat.CUSD();
            CEURToken = CryptoEuroToken.at(CEURTokenAddress);
            CUSDToken = CryptoDollarToken.at(CUSDTokenAddress);

            let conversionRates = await cryptoFiat.conversionRate.call();
            let txnObj, txn, txnReceipt;

            await setUSDConversionRate(cryptoFiat, 20000);
            await setEURConversionRate(cryptoFiat, 20000);

            txnObj = {from: investor, value: 1 * 10 ** 18, gas: gas};
            await OrderCUSD(cryptoFiat, txnObj);
            await OrderCEUR(cryptoFiat, txnObj);

            await setUSDConversionRate(cryptoFiat, 10000);
            await setEURConversionRate(cryptoFiat, 10000);

        });

        it('should be in unpegged state', async function() {

            let currentState = await getState(cryptoFiat);
            currentState.should.be.equal("UNPEGGED");

            let buffer = await getBuffer(cryptoFiat);
            buffer.should.be.below(0);

        });


        it('should be able to sell unpegged CEUR tokens', async function() {
            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellUnpeggedCEUR(1, params).should.be.fulfilled;
        });

        it('should be able to sell unpegged CUSD tokens', async function() {
            params = {from: investor, gas: 200000}
            txn = await cryptoFiat.sellUnpeggedCUSD(100, params).should.be.fulfilled;
        });


        it('should correctly decrease the total CEUR supply', async function() {
            params = {from: investor, gas: 200000};
            let initialSupply = await getTotalCEURSupply(cryptoFiat);

            await sellUnpeggedOrderCEUR(cryptoFiat, 10, investor);

            let supply = await getTotalCEURSupply(cryptoFiat);
            supply.should.be.equal(initialSupply - 10);
        });

        it('should correctly decrease the total CUSD supply', async function() {
            params = {from: investor, gas: 200000};
            let initialSupply = await getTotalCUSDSupply(cryptoFiat);

            await sellUnpeggedOrderCUSD(cryptoFiat, 10, investor);

            let supply = await getTotalCUSDSupply(cryptoFiat);
            supply.should.be.equal(initialSupply - 10);
            
        });

        it('should correctly decrease the investor CUSD balance', async function() {
            params = {from: investor, gas: 200000};
            let initialBalance = await getCUSDBalance(cryptoFiat, investor);

            await sellUnpeggedOrderCUSD(cryptoFiat, 10, investor);

            let balance = await getCUSDBalance(cryptoFiat, investor);
            balance.should.be.bignumber.equal(initialBalance - 10);
        });


        it('should correctly decrease the investor CEUR balance', async function() {
            params = {from: investor, gas: 200000};
            let initialBalance = await getCEURBalance(cryptoFiat, investor);

            await sellUnpeggedOrderCEUR(cryptoFiat, 10, investor);

            let balance = await getCEURBalance(cryptoFiat, investor);
            balance.should.be.bignumber.equal(initialBalance - 10);

        });

        it('should return reserved ether if 100% of tokens are sent', async function() {

            let CUSDBalance = await getCUSDBalance(cryptoFiat, investor);
            let reservedEther = await getReservedEther(CUSDToken, investor);
            let initialBalance = web3.eth.getBalance(investor).toNumber();

            let txnReceipt = await sellUnpeggedOrderCUSD(cryptoFiat, CUSDBalance, investor);
            let expectedIncrement = web3.fromWei(reservedEther - txnReceipt.gasUsed * gasPrice, 'ether');

            let balance = web3.eth.getBalance(investor).toNumber();
            
            let increment = web3.fromWei(balance-initialBalance, 'ether');

            expect(increment).to.almost.equal(expectedIncrement,2);
        });

        it('should return reserved ether if 100% of CEUR tokens are sent', async function() {

            let CEURBalance = await getCEURBalance(cryptoFiat, investor);
            let reservedEther = await getReservedEther(CEURToken, investor);
            let initialBalance = web3.eth.getBalance(investor).toNumber();
            
            let txnReceipt = await sellUnpeggedOrderCEUR(cryptoFiat, CEURBalance, investor);
            let expectedIncrement = web3.fromWei(reservedEther - txnReceipt.gasUsed * gasPrice, 'ether');

            let balance = web3.eth.getBalance(investor).toNumber();
            
            let increment = web3.fromWei(balance-initialBalance, 'ether');

            expect(increment).to.almost.equal(expectedIncrement,2);

        });

        it('should return 50% of reserved ether if 50% of CUSD tokens are sent', async function() {

            let CUSDBalance = await getCUSDBalance(cryptoFiat, investor);
            let reservedEther = await getReservedEther(CUSDToken, investor);
            let initialBalance = web3.eth.getBalance(investor).toNumber();

            let tokenAmount = Math.floor(CUSDBalance / 2);

            let txnReceipt = await sellUnpeggedOrderCUSD(cryptoFiat, tokenAmount, investor);


            let expectedIncrement = web3.fromWei(0.5 * reservedEther - txnReceipt.gasUsed * gasPrice, 'ether');
            let balance = web3.eth.getBalance(investor).toNumber();
            let increment = web3.fromWei((balance-initialBalance), 'ether');

            expect(increment).to.almost.equal(expectedIncrement,2);
        });


        it('should return 50% of reserved ether if 50% of CEUR tokens are sent', async function() {
            
            let CEURBalance = await getCEURBalance(cryptoFiat, investor);
            let reservedEther = await getReservedEther(CEURToken, investor);
            let initialBalance = web3.eth.getBalance(investor).toNumber();

            let tokenAmount = Math.floor(CEURBalance / 2);

            let txnReceipt = await sellUnpeggedOrderCEUR(cryptoFiat, tokenAmount, investor);
            
            let expectedIncrement = web3.fromWei(0.5 * reservedEther - txnReceipt.gasUsed * gasPrice, 'ether');
            let balance = web3.eth.getBalance(investor).toNumber();
            let increment = web3.fromWei((balance-initialBalance), 'ether');

            expect(increment).to.almost.equal(expectedIncrement, 4);

        });
        

        // it('should correctly increase investor balance (EUR)', async function() {

        //     let CUSDBalance = await getCUSDBalance(cryptoFiat, investor);
        //     let reservedEther = await getReservedEther(CUSDToken, investor);
        //     let initialBalance = getBalance(investor);

        //     let tokenNumber = 1000000;
        //     let expectedIncrement = reservedEther * (tokenNumber / CUSDBalance);
            
        //     await sellUnpeggedOrderCUSD(cryptoFiat, tokenNumber, investor);

        //     let balance = getBalance(investor);
            
        //     let balanceIncrement = balance - initialBalance;
        //     expect(balanceIncrement).to.almost.equal(expectedIncrement,1);

        // });

        // it('should correctly increase investor balance (EUR)', async function() {

        //     let initialBalance = web3.eth.getBalance(investor);
        //     initialBalance = Number(initialBalance.toString());
        //     let expectedBalance = initialBalance + 1000 * ether / ETH_EUR;

        //     params = {from: investor, gas: 200000};
        //     txn = await cryptoFiat.sellCEURTokens(1000, params);
        //     let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

        //     let balance = web3.eth.getBalance(investor);
        //     balance = Number(balance.toString())
        //     expect(h.inEther(balance)).to.almost.equal(h.inEther(expectedBalance),1);

        // });


        // it('should payout around 0.39 ether for 10000 token base units (= 100,00 CEUR) ', async function() {

        //     let initialBalance = h.getBalanceInWei(investor);
        //     let expectedBalanceIncrement = 10000 * ether / ETH_EUR;

        //     params = {from: investor, gas: 200000}
        //     txn = await cryptoFiat.sellCEURTokens(10000, params);
        //     let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

        //     let balance = h.getBalanceInWei(investor);
        //     expect(h.inEther(balance-initialBalance)).to.almost.equal(h.inEther(expectedBalanceIncrement),5);
        // });


        // it('should payout around ether for 10000 token base uints (= 100,00 CUSD) ', async function() {
        //     let initialBalance = h.getBalanceInWei(investor);
        //     let expectedBalanceIncrement = 100000 * ether / ETH_USD;

        //     params = {from: investor, gas: gas, gasPrice: gasPrice}
        //     txn = await cryptoFiat.sellCUSDTokens(100000, params);
        //     let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
            

        //     let balance = h.getBalanceInWei(investor);
        //     expect(h.inEther(balance-initialBalance-gas*gasPrice)).to.almost.equal(h.inEther(expectedBalanceIncrement), 5);
        // });
            
    });
            




    // describe('Buffer', function() {

        
    //     beforeEach(async function() {

    //         cryptoFiat = await CryptoFiat.new();
    //         CEURTokenAddress = await cryptoFiat.CEUR();
    //         CUSDTokenAddress = await cryptoFiat.CUSD();
    //         CEURToken = CryptoEuroToken.at(CEURTokenAddress);
    //         CUSDToken = CryptoDollarToken.at(CUSDTokenAddress);
            
    //     });

    //     it('should be initially equal to the initial capital', async function() {

    //         let initialBuffer = await getBuffer(cryptoFiat);
    //         initialBuffer.should.be.equal(0);

    //     });

    //     it('should not change if CUSD tokens are bought', async function() {

    //         let txnObj = {from: investor, value: investment, gas: 200000}
    //         let initialBuffer = await getBuffer(cryptoFiat);
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCEUR(cryptoFiat, txnObj);

    //         let buffer = await getBuffer(cryptoFiat);
    //         expect(buffer).to.almost.equal(initialBuffer + fee);

    //     });

    //     it('should not change if CEUR tokens are bought', async function() {
            
    //         let txnObj = {from: investor, value: investment, gas: 200000}
    //         let initialBuffer = await getBuffer(cryptoFiat);
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCEUR(cryptoFiat, txnObj);

    //         let buffer = await getBuffer(cryptoFiat);
    //         expect(buffer).to.almost.equal(initialBuffer + fee)

    //     });

    //     it('should be multiplied by two if the USD conversion rate is divided by two (and CEUR bucket - initial capital are zero)', async function() {

    //         let txnObj = {from: investor, value: 10 ** 5, gas: 200000};
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCUSD(cryptoFiat, txnObj);

    //         let initialBuffer = await cryptoFiat.buffer.call();

    //         let newConversionRate = await getUSDConversionRate(cryptoFiat);
    //         newConversionRate = Math.floor(newConversionRate / 2);

    //         let totalBalance = await cryptoFiat.totalBalance.call();
    //         let totalCryptoFiatValue = await cryptoFiat.totalCryptoFiatValue.call();

    //         txn = await cryptoFiat.setUSDConversionRate(newConversionRate, {from: investor, gas: 2000000 });
    //         let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let buffer = await cryptoFiat.buffer.call();
    //         totalBalance = await cryptoFiat.totalBalance.call();
    //         totalCryptoFiatValue = await cryptoFiat.totalCryptoFiatValue.call();

    //         console.log(newConversionRate)
    //         console.log(totalBalance)
    //         console.log(totalCryptoFiatValue)
    //         console.log(buffer)

    //         buffer.should.be.bignumber.equal(initialBuffer / 2);

    //     });

        

    //     it('should be divided by two if the EUR conversion rate is divided by two (and CUSD bucket - initial capital are zero)', async function() {

    //         let txnObj = {from: investor, value: 10 ** 5, gas: 200000};
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCEUR(cryptoFiat, txnObj);

    //         let initialBuffer = await getBuffer(cryptoFiat);

    //         let newConversionRate = await getEURConversionRate(cryptoFiat) / 2;
    //         txn = await cryptoFiat.setEURConversionRate(newConversionRate, {from: investor, gas: 2000000 });
    //         let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
            
    //         let buffer = await getBuffer(cryptoFiat);
    //         expect(buffer).to.almost.equal(initialBuffer / 2);

    //     });

    // });


   
        

        


        // it('should increment dollar token balance', async function() {

        //     let initialUSDTokenBalance = await cryptoFiat.cryptoDollarBalance(investor);
            
        //     txn = await cryptoFiat.buyCryptoDollarTokens(params);
        //     txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

        //     let USDTokenBalance = await cryptoFiat.cryptoDollarBalance(investor);
                
        //     let dollarConversionRate = await cryptoFiat.dollarConversionRate.call();
        //     let expectedUSDTokenIncrement = dollarConversionRate * h.inEther(investment);

        //     (USDTokenBalance - initialUSDTokenBalance).should.be.equal(expectedUSDTokenIncrement);

        // });

        // it('should increment euro token balance', async function() {

        //     let initialEURTokenBalance = await cryptoFiat.cryptoEuroBalance(investor);
            
        //     txn = await cryptoFiat.buyCryptoEuroTokens(params);
        //     txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

        //     let EURTokenBalance = await cryptoFiat.cryptoEuroBalance(investor);
                
        //     let euroConversionRate = await cryptoFiat.euroConversionRate.call();
        //     let expectedEURTokenIncrement =  euroConversionRate * h.inEther(investment);
            
        //     (EURTokenBalance-initialEURTokenBalance).should.be.bignumber.equal(expectedEURTokenIncrement);

        // });




    // describe('Token Balance functionality', function() {

    //     before(function() {
    //         params = {from: investor, value: investment, gas: 200000 }
    //         let cryptoDollarBalance;
    //         let cryptoEuroBalance;
    //     })

    //     it('should display euro token balance', async function() {
            

    //         let euroTokenBalance = await cryptoFiat.cryptoDollarBalance(investor);
    //         euroTokenBalance = Number(euroTokenBalance.toString());
    //         euroTokenBalance.should.be.a('number');

    //     });

    //     it('should display dollar token balance', async function() {

    //         let dollarTokenBalance = await cryptoFiat.cryptoDollarBalance(investor);
    //         dollarTokenBalance = Number(dollarTokenBalance.toString());
    //         dollarTokenBalance.should.be.a('number');

    //     });

        

    // })

    // describe('Sell tokens functionality', function() {

    //     beforeEach(async function() {

    //         params = {from: investor, gasPrice: gasPrice }
    //         ETH_USD_InCents = await cryptoFiat.dollarConversionRate.call();
    //         ETH_EUR_InCents = await cryptoFiat.euroConversionRate.call();
    //         tokenAmount = h.inCents(500);
           
    //     });

    //     it('should decrease the total dollar token supply', async function() {

    //         let initialCryptoUSDSupply = await cryptoFiat.totalCryptoDollar.call();    
    //         txn = await cryptoFiat.sellCryptoDollarTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let cryptoUSDSupply = await cryptoFiat.totalCryptoDollar.call();
    //         let expectedCryptoUSDSupply = initialCryptoUSDSupply - tokenAmount;

    //         cryptoUSDSupply.should.be.bignumber.equal(expectedCryptoUSDSupply);

    //     })

    //     it('should decrease the total euro token supply', async function() {

    //         let initialCryptoEURSupply = await cryptoFiat.totalCryptoEuro.call();            
            
    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let cryptoEURSupply = await cryptoFiat.totalCryptoEuro.call();

    //         cryptoEURSupply.should.be.bignumber.equal(initialCryptoEURSupply - tokenAmount);

    //     });


    //     it('should send expected amount of ether in exchange of crypto USD tokens', async function() {

    //         let initialinvestorBalance = web3.eth.getBalance(investor);
    //         txn = await cryptoFiat.sellCryptoDollarTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    //         let gasUsed = txnReceipt.gasUsed;

    //         let investorBalance = web3.eth.getBalance(investor);
    //         let balanceIncrement = Number(h.inEther(investorBalance - initialinvestorBalance));
    //         let expectedinvestorBalanceIncrement =  (tokenAmount / ETH_USD_InCents) - h.inEther(gasUsed * gasPrice);

    //         expect(balanceIncrement).to.almost.equal(expectedinvestorBalanceIncrement, 3)

    //     });

    //     it('should send expected amount of ether in exchange of crypto EUR tokens', async function() {

    //         let initialinvestorBalance = web3.eth.getBalance(investor);

    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    //         let gasUsed = Number(txnReceipt.gasUsed);

    //         let investorBalance = web3.eth.getBalance(investor);
    //         let balanceIncrement = Number(h.inEther(investorBalance - initialinvestorBalance));
    //         let expectedBalanceIncrement =  (tokenAmount / ETH_EUR_InCents) - h.inEther(gasUsed * gasPrice);

    //         expect(balanceIncrement).to.almost.equal(expectedBalanceIncrement, 6)

    //     });

    //     it('should decrease the crypto USD sender balance', async function() {

    //         let initialCryptoUSDBalance = await cryptoFiat.cryptoDollarBalance(investor);

    //         txn = await cryptoFiat.sellCryptoDollarTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let cryptoUSDBalance = await cryptoFiat.cryptoDollarBalance(investor);
    //         let tokenBalanceDecrement = initialCryptoUSDBalance.minus(cryptoUSDBalance);

    //         (tokenBalanceDecrement).should.be.bignumber.equal(tokenAmount)
    //     });


    //     it('should decrease the crypto EUR sender balance', async function() {
                
    //         let initialCryptoEURBalance = await cryptoFiat.cryptoEuroBalance(investor);
    //         let tokenAmount = h.inCents(500);

    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
            
    //         let cryptoEURBalance = await cryptoFiat.cryptoEuroBalance(investor);
    //         let tokenBalanceDecrement = initialCryptoEURBalance.minus(cryptoEURBalance);

    //         (tokenBalanceDecrement).should.be.bignumber.equal(tokenAmount);
            
    //     });




    // });

});
