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

// const ether = h.ether;
// const getBalance = h.getBalance;

const getBufferFee = (value) => { return value / 200; }
const applyFee = (value, fee) => { return value * (1-fee)}
const getFee = (value, fee) => { return value * fee }

const getTotalSupply = async (token) => { 
    let tokenSupply = await token.totalSupply.call();
    return tokenSupply.toNumber();
 }

const getContractBalance = async (contract) => {
    let contractBalance = await contract.contractBalance.call();
    return contractBalance[0].toNumber(); 
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



contract('CryptoFiat', (accounts) => {
    
    let cryptoFiat;
    let ether = 10 ** 18;
    let cryptoEuroTokenAddress;
    let cryptoDollarTokenAddress;
    let CEURToken;
    let CUSDToken;
    let txn;
    let txn_receipt;
    let params;
    let ETH_USD_InCents = 25445;
    let ETH_EUR_InCents = 23013;
    let ETH_USD_Rate = ETH_USD_InCents / (10 ** 2);
    let ETH_EUR_Rate = ETH_USD_InCents / (10 ** 2);
    let ETH_EUR;
    let ETH_USD;
    let gas = 2000000;
    let gasPrice = 600000000;
    let tokenAmount = h.inCents(500);
    let euroConversionRate;
    let dollarConversionRate;
    let logs = [];
    let events;

    const investment = 1 * ether;
    const buyAmount = 1 * ether;
    const investor = accounts[1];
    
    beforeEach(async function() {

        cryptoFiat = await CryptoFiat.deployed();
        cryptoEuroTokenAddress = await cryptoFiat.CEUR();
        cryptoDollarTokenAddress = await cryptoFiat.CUSD();
        CEURToken = CryptoEuroToken.at(cryptoEuroTokenAddress);
        CUSDToken = CryptoDollarToken.at(cryptoDollarTokenAddress);

    });

    after(function() {
        events = cryptoFiat.allEvents({fromBlock: 0, toBlock: 'latest'});
        events.get(function(error,result) {
            let i = 0;
            let j = 0;
            result.forEach(function(log) {
                console.log(i++ + ". " + log.event + ": ");
                Object.keys(log.args).forEach(function(key) {
                    console.log(key + ": " + log.args[key].toString());
                });
                console.log("\n");
            });
        });
    });

    describe('Ownership', function() {
        
        it('should initially own the CryptoEuro token', async function() {
            let CEUROwnerAddress = await CEURToken.owner.call()
            let cryptoFiatAddress = cryptoFiat.address;
            assert.equal(cryptoFiatAddress, CEUROwnerAddress)
        });

        it('should initially own the CryptoDollar token', async function() {
            let CUSDOwnerAddress = await CUSDToken.owner.call()
            let cryptoFiatAddress = cryptoFiat.address;
            assert.equal(cryptoFiatAddress, CUSDOwnerAddress)
        });


    });

    describe('Initial state', function() {

        it('should have euro conversion rate set correctly', async function() {
            let conversionRates = await cryptoFiat.conversionRate.call();
            let ETH_USD = conversionRates[0].toNumber();
            let ETH_EUR = conversionRates[1].toNumber();

            ETH_USD.should.be.bignumber.equal(25445);
            ETH_EUR.should.be.bignumber.equal(23013);
            
        });


        it('should have initial crypto tokens issued equal to 0', async function() {
            let totalCEUR = await getTotalSupply(CEURToken);
            let totalCUSD = await getTotalSupply(CUSDToken)
            assert.equal(totalCEUR, 0);
            assert.equal(totalCUSD, 0);
        });

        it('investors should initially have an empty token balance', async function() {
                
            let CUSDBalance = await CUSDToken.balanceOf(investor);
            CUSDBalance.should.be.bignumber.equal(0);

            let CEURBalance = await CEURToken.balanceOf(investor);
            CEURBalance.should.be.bignumber.equal(0);

        });

        it('should have an initial buffer value equal to 0', async function() {
            let buffer = await cryptoFiat.buffer.call();
            Number(buffer).should.be.equal(0);
        });


    });


    describe('Buy Tokens functionality', function() {

        before(async function() {
            params = {from: investor, value: investment, gas: 200000 }
            let conversionRates = await cryptoFiat.conversionRate.call();
            ETH_USD = conversionRates[0].toNumber();
            ETH_EUR = conversionRates[1].toNumber();

        });
              
        it('should increase the buffer by 5%', async function() {

            let initialBufferValue = await cryptoFiat.buffer.call();

            txn = await cryptoFiat.buyCUSDTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);
            let bufferFee = getFee(investment, 0.005);

            let bufferValue = await cryptoFiat.buffer.call();
            
            (bufferValue-initialBufferValue).should.be.bignumber.equal(bufferFee);

        });

            
        it('should be able to buy CEUR tokens', async function() {
            txn = await cryptoFiat.buyCEURTokens(params).should.be.fulfilled;
        });

        it('should be able to buy CUSD tokens', async function() {
            txn = await cryptoFiat.buyCUSDTokens(params).should.be.fulfilled;
        });

        it('should increase total euro token supply', async function() {

            let initialTokenSupply = await getTotalSupply(CEURToken)

            let value = applyFee(investment, 0.01);
            txn = await cryptoFiat.buyCEURTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

            let tokenSupply = await getTotalSupply(CEURToken);
            
            let expectedTokenSupply = Math.floor(initialTokenSupply + ETH_EUR * h.inEther(value));
            tokenSupply.should.be.equal(expectedTokenSupply);

        });


        it('should increase total dollar token supply', async function() {
            
            let initialTokenSupply = await getTotalSupply(CUSDToken);
            let amount = applyFee(investment, 0.01);
            
            txn = await cryptoFiat.buyCUSDTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

            let tokenSupply = await getTotalSupply(CUSDToken);
            

            let expectedTokenSupply = initialTokenSupply + ETH_USD * h.inEther(amount);
            expectedTokenSupply = Math.floor(expectedTokenSupply);
            tokenSupply.should.be.equal(expectedTokenSupply);

        });

        it('should increase the total proof token holders balance', async function() {
            
            //total proof token holders
            //the expected balance should be incremented by .5% of the investment
            let initialBalance = await getContractBalance(cryptoFiat);
            let expectedBalance = initialBalance + getFee(investment, 0.005);

            txn = await cryptoFiat.buyCEURTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

            let contractBalance = await getContractBalance(cryptoFiat)
            contractBalance.should.be.equal(expectedBalance);

        });

        it('should increase the total crypto token holders balance', async function() {


            //total ether reserved for crypto token holders
            //the total balance reserved for crypto token holders should be incremented by 99% of the investment
            let initialBalance = await getTotalCryptoTokenHolders(cryptoFiat);
            let expectedBalance = initialBalance + applyFee(investment, 0.01);

            txn = await cryptoFiat.buyCUSDTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

            let balance = await getTotalCryptoTokenHolders(cryptoFiat);
            balance.should.be.equal(expectedBalance);

        });


        it('should increase the total ether in the smart contract', async function() {

            let initialEtherSupply = web3.eth.getBalance(cryptoFiat.address);

            txn = await cryptoFiat.buyCUSDTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

            let etherSupply = web3.eth.getBalance(cryptoFiat.address);

            (etherSupply-initialEtherSupply).should.be.bignumber.equal(investment);

        });


        it('should increment investor CUSD token balance', async function() {

            let initialBalance = await getCUSDBalance(cryptoFiat, investor);
            let amount = applyFee(investment, 0.01)
            let expectedBalance = Math.floor(initialBalance + ETH_USD * h.inEther(amount));

            txn = await cryptoFiat.buyCUSDTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

            let balance = await getCUSDBalance(cryptoFiat, investor);
            balance.should.be.equal(expectedBalance);

        });


        it('should increment investor CEUR token balance', async function() {

            let amount = applyFee(investment, 0.01)
            let initialBalance = await getCEURBalance(cryptoFiat, investor);
            let expectedBalance = Math.floor(initialBalance + ETH_EUR * h.inEther(amount));

            txn = await cryptoFiat.buyCEURTokens(params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

            let balance = await getCEURBalance(cryptoFiat, investor);
            balance.should.be.equal(expectedBalance);

        });

    });

    describe('Sell tokens functionality', function() {

        before(async function() {
            params = {from: investor, value: investment, gas: 200000 }
            let conversionRates = await cryptoFiat.conversionRate.call();
            ETH_USD = conversionRates[0].toNumber();
            ETH_EUR = conversionRates[1].toNumber();

        });

        it('should be able to sell CEUR tokens', async function() {
            params = {from: investor, gas: 200000}
            txn = await cryptoFiat.sellCEURTokens(10, params).should.be.fulfilled;
        });

        it('should be able to sell CUSD tokens', async function() {
            params = {from: investor, gas: 200000}
            txn = await cryptoFiat.sellCUSDTokens(10, params).should.be.fulfilled;
        });

        it('should correctly decrease the total CUSD balance', async function() {

            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellCUSDTokens(10, params);
            txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

        });

        it('should correctly decrease the total CEUR balance', async function() {

            let initialCEURSupply = await cryptoFiat.CEURTotalSupply.call();

            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellCEURTokens(10, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let CEURSupply = await cryptoFiat.CEURTotalSupply.call();

            CEURSupply.should.be.bignumber.equal(initialCEURSupply - 10);

        });

        it('should correctly decrease the total CUSD balance', async function() {

            let initialCUSDSupply = await cryptoFiat.CUSDTotalSupply.call();

            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellCUSDTokens(10, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let CUSDSupply = await cryptoFiat.CUSDTotalSupply.call();
            CUSDSupply.should.be.bignumber.equal(initialCUSDSupply - 10);

        });

        it('should correctly decrease the investor CUSD balance', async function() {
            
            let initialCUSDBalance = await cryptoFiat.CUSDBalance(investor);

            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellCUSDTokens(10, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let CUSDBalance = await cryptoFiat.CUSDBalance.call(investor);
            CUSDBalance.should.be.bignumber.equal(initialCUSDBalance - 10);

        });

        it('should correctly decrease the investor CEUR balance', async function() {

            let initialCEURBalance = await cryptoFiat.CEURBalance(investor);

            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellCEURTokens(10, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let CEURBalance = await cryptoFiat.CEURBalance.call(investor);
            CEURBalance.should.be.bignumber.equal(initialCEURBalance - 10);

        });

        it('should correctly increase investor balance (USD)', async function() {

            let initialBalance = getBalance(investor);
            let expectedIncrement = h.inEther(1000 * ether / ETH_USD);

            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellCUSDTokens(1000, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let balance = getBalance(investor);
            let increment = h.inEther(balance - initialBalance)
            expect(increment).to.almost.equal(expectedIncrement,1);

        });

        it('should correctly increase investor balance (EUR)', async function() {

            let initialBalance = getBalance(investor);
            let expectedBalance = initialBalance + 1000 * ether / ETH_EUR;

            params = {from: investor, gas: 200000};
            txn = await cryptoFiat.sellCEURTokens(1000, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let balance = getBalance(investor);
            expect(h.inEther(balance)).to.almost.equal(h.inEther(expectedBalance),1);

        });


        it('should payout around 0.39 ether for 10000 token base units (= 100,00 CEUR) ', async function() {

            let initialBalance = h.getBalanceInWei(investor);
            let expectedBalanceIncrement = 10000 * ether / ETH_EUR;

            params = {from: investor, gas: gas, gasPrice: gasPrice};
            txn = await cryptoFiat.sellCEURTokens(10000, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let balance = h.getBalanceInWei(investor);
            expect(h.inEther(balance-initialBalance)).to.almost.equal(h.inEther(expectedBalanceIncrement),3);
        });


        it('should payout around ether for 10000 token base uints (= 100,00 CUSD) ', async function() {
            let initialBalance = h.getBalanceInWei(investor);
            let expectedBalanceIncrement = 100000 * ether / ETH_USD;

            params = {from: investor, gas: gas, gasPrice: gasPrice};
            txn = await cryptoFiat.sellCUSDTokens(100000, params);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
            

            let balance = h.getBalanceInWei(investor);
            expect(h.inEther(balance-initialBalance)).to.almost.equal(h.inEther(expectedBalanceIncrement), 3);
        });
            
    });

    describe('Change conversion rates', function() {

        it('shoud be able to change USD conversion rate', async function() {
            let txnObj = {from: investor, gas: gas};
            txn = await cryptoFiat.changeUSDConversionRate(20000, txnObj);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let newConversionRate = await cryptoFiat.conversionRate.call();
            let ETH_USD = newConversionRate.toNumber()[0];

            ETH_USD.should.be.equal(20000);

        });

        it('should be able to change EUR conversion rate', async function() {
            let txnObj = {from: investor, gas: gas};
            txn = await cryptoFiat.changeEURConversionRate(20000, txnObj);
            let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            let newConversionRate = await cryptoFiat.conversionRate.call();
            let ETH_EUR = newConversionRate.toNumber()[1];

            ETH_EUR.should.be.equal(20000);

        })


    })


    describe('Sell Unpegged Tokens functionality', function() {


            before(async function() {
                params = {from: investor, value: investment, gas: 200000}
                let conversionRates = await cryptoFiat.conversionRate.call();
                ETH_EUR = 10000;
                ETH_USD = 20000;
                cryptoFiat = await CryptoFiat.new();

                txn_obj = {from: investor, value: investment, gas: 2000000}
                txn = await cryptoFiat.buyCUSDTokens(txn_obj);
                let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            });

            it('should be able to sell CEUR tokens', async function() {
                params = {from: investor, gas: 200000}
                txn = await cryptoFiat.sellUnpeggedCEUR(100, params).should.be.fulfilled;
            });

            it('should be able to sell CUSD tokens', async function() {
                params = {from: investor, gas: 200000}
                txn = await cryptoFiat.sellUnpeggedCUSD(100, params).should.be.fulfilled;
            });


            it('should correctly decrease the total CEUR balance', async function() {

                let initialCEURSupply = await cryptoFiat.CEURTotalSupply.call();

                params = {from: investor, gas: 200000};
                txn = await cryptoFiat.sellUnpeggedCEUR(10, params);
                let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

                let CEURSupply = await cryptoFiat.CEURTotalSupply.call();

                CEURSupply.should.be.bignumber.equal(initialCEURSupply - 10);

            });

            it('should correctly decrease the total CUSD balance', async function() {

                let initialCUSDSupply = await cryptoFiat.CUSDTotalSupply.call();

                params = {from: investor, gas: 200000};
                txn = await cryptoFiat.sellUnpeggedCUSD(10, params);
                let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

                let CUSDSupply = await cryptoFiat.CUSDTotalSupply.call();
                CUSDSupply.should.be.bignumber.equal(initialCUSDSupply - 10);

            });

            it('should correctly decrease the investor CUSD balance', async function() {
                
                let initialCUSDBalance = await cryptoFiat.CUSDBalance(investor);

                params = {from: investor, gas: 200000};
                txn = await cryptoFiat.sellUnpeggedCUSD(10, params);
                let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

                let CUSDBalance = await cryptoFiat.CUSDBalance.call(investor);
                CUSDBalance.should.be.bignumber.equal(initialCUSDBalance - 10);

            });

            // it('should correctly decrease the investor CEUR balance', async function() {

            //     let initialCEURBalance = await cryptoFiat.CEURBalance(investor);

            //     params = {from: investor, gas: 200000};
            //     txn = await cryptoFiat.sellCEURTokens(10, params);
            //     let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            //     let CEURBalance = await cryptoFiat.CEURBalance.call(investor);
            //     CEURBalance.should.be.bignumber.equal(initialCEURBalance - 10);

            // });

            // it('should correctly increase investor balance (USD)', async function() {

            //     let CUSDBalance = await cryptoFiat.CUSDBalance(investor);
            //     let initialBalance = web3.eth.getBalance(investor);
            //     initialBalance = Number(initialBalance.toString());
            //     let expectedIncrement = h.inEther(1000 * ether / ETH_USD);

            //     params = {from: investor, gas: 200000};
            //     txn = await cryptoFiat.sellCUSDTokens(1000, params);
            //     let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

            //     let balance = web3.eth.getBalance(investor);
            //     balance = Number(balance.toString());
            //     let balanceIncrement = h.inEther(balance - initialBalance)
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
            

        

        


        // it('should increment dollar token balance', async function() {

        //     let initialUSDTokenBalance = await cryptoFiat.cryptoDollarBalance(investor);
            
        //     txn = await cryptoFiat.buyCryptoDollarTokens(params);
        //     txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

        //     let USDTokenBalance = await cryptoFiat.cryptoDollarBalance(investor);
                
        //     let dollarConversionRate = await cryptoFiat.dollarConversionRate.call();
        //     let expectedUSDTokenIncrement = dollarConversionRate * h.inEther(investment);

        //     (USDTokenBalance - initialUSDTokenBalance).should.be.equal(expectedUSDTokenIncrement);

        // });

        // it('should increment euro token balance', async function() {

        //     let initialEURTokenBalance = await cryptoFiat.cryptoEuroBalance(investor);
            
        //     txn = await cryptoFiat.buyCryptoEuroTokens(params);
        //     txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

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
    //         txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let cryptoUSDSupply = await cryptoFiat.totalCryptoDollar.call();
    //         let expectedCryptoUSDSupply = initialCryptoUSDSupply - tokenAmount;

    //         cryptoUSDSupply.should.be.bignumber.equal(expectedCryptoUSDSupply);

    //     })

    //     it('should decrease the total euro token supply', async function() {

    //         let initialCryptoEURSupply = await cryptoFiat.totalCryptoEuro.call();            
            
    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let cryptoEURSupply = await cryptoFiat.totalCryptoEuro.call();

    //         cryptoEURSupply.should.be.bignumber.equal(initialCryptoEURSupply - tokenAmount);

    //     });


    //     it('should send expected amount of ether in exchange of crypto USD tokens', async function() {

    //         let initialInvestorBalance = web3.eth.getBalance(investor);
    //         txn = await cryptoFiat.sellCryptoDollarTokens(tokenAmount, params);
    //         txn_receipt = await h.waitUntilTransactionsMined(txn.tx);
    //         let gasUsed = txn_receipt.gasUsed;

    //         let investorBalance = web3.eth.getBalance(investor);
    //         let balanceIncrement = Number(h.inEther(investorBalance - initialInvestorBalance));
    //         let expectedInvestorBalanceIncrement =  (tokenAmount / ETH_USD_InCents) - h.inEther(gasUsed * gasPrice);

    //         expect(balanceIncrement).to.almost.equal(expectedInvestorBalanceIncrement, 3)

    //     });

    //     it('should send expected amount of ether in exchange of crypto EUR tokens', async function() {

    //         let initialInvestorBalance = web3.eth.getBalance(investor);

    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txn_receipt = await h.waitUntilTransactionsMined(txn.tx);
    //         let gasUsed = Number(txn_receipt.gasUsed);

    //         let investorBalance = web3.eth.getBalance(investor);
    //         let balanceIncrement = Number(h.inEther(investorBalance - initialInvestorBalance));
    //         let expectedBalanceIncrement =  (tokenAmount / ETH_EUR_InCents) - h.inEther(gasUsed * gasPrice);

    //         expect(balanceIncrement).to.almost.equal(expectedBalanceIncrement, 6)

    //     });

    //     it('should decrease the crypto USD sender balance', async function() {

    //         let initialCryptoUSDBalance = await cryptoFiat.cryptoDollarBalance(investor);

    //         txn = await cryptoFiat.sellCryptoDollarTokens(tokenAmount, params);
    //         txn_receipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let cryptoUSDBalance = await cryptoFiat.cryptoDollarBalance(investor);
    //         let tokenBalanceDecrement = initialCryptoUSDBalance.minus(cryptoUSDBalance);

    //         (tokenBalanceDecrement).should.be.bignumber.equal(tokenAmount)
    //     });


    //     it('should decrease the crypto EUR sender balance', async function() {
                
    //         let initialCryptoEURBalance = await cryptoFiat.cryptoEuroBalance(investor);
    //         let tokenAmount = h.inCents(500);

    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txn_receipt = await h.waitUntilTransactionsMined(txn.tx);
            
    //         let cryptoEURBalance = await cryptoFiat.cryptoEuroBalance(investor);
    //         let tokenBalanceDecrement = initialCryptoEURBalance.minus(cryptoEURBalance);

    //         (tokenBalanceDecrement).should.be.bignumber.equal(tokenAmount);
            
    //     });




    // });

});
