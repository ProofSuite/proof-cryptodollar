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


let gas = 2*10**6;
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
    let defaultOrder;
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
    const investor1 = accounts[1];
    const investor2 = accounts[2];
    const market = accounts[3];

    before(async function() {
        cryptoFiat = await CryptoFiat.new();
        CEURTokenAddress = await cryptoFiat.CEUR();
        CUSDTokenAddress = await cryptoFiat.CUSD();
        CEURToken = CryptoEuroToken.at(CEURTokenAddress);
        CUSDToken = CryptoDollarToken.at(CUSDTokenAddress);

    })
    

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

            ETH_USD.should.be.bignumber.equal(25000);
            ETH_EUR.should.be.bignumber.equal(20000);
            
        });


        it('should have initial crypto tokens issued equal to 0', async function() {
            let totalCEUR = await getTotalSupply(CEURToken);
            let totalCUSD = await getTotalSupply(CUSDToken)
            assert.equal(totalCEUR, 0);
            assert.equal(totalCUSD, 0);
        });

        it('investor1s should initially have an empty token balance', async function() {
                
            let CUSDBalance = await CUSDToken.balanceOf(investor1);
            CUSDBalance.should.be.bignumber.equal(0);

            let CEURBalance = await CEURToken.balanceOf(investor1);
            CEURBalance.should.be.bignumber.equal(0);

        });

        it('investor1 should initially have an empty token balance', async function() {

            let balance;

            balance = await CUSDToken.reservedEther(investor1);
            balance.should.be.bignumber.equal(0);

            balance = await CEURToken.reservedEther(investor1);
            balance.should.be.bignumber.equal(0);
            
        });

        it('should have an initial buffer value equal to 0', async function() {
            let buffer = await cryptoFiat.buffer.call();
            Number(buffer).should.be.equal(0);
        });


        it('should be in pegged state', async function() {

            await OrderCUSD(cryptoFiat, defaultOrder);
            
            let currentState = await getState(cryptoFiat);
            currentState.should.be.equal("PEGGED");
            
        });


    });


    describe('Buying Tokens', function() {

        before(async function() {
            defaultOrder = {from: investor1, value: investment, gas: 200000 };
            let conversionRates = await cryptoFiat.conversionRate.call();
            ETH_USD = conversionRates[0].toNumber();
            ETH_EUR = conversionRates[1].toNumber();

        });
        
        it('should be able to buy CEUR tokens', async function() {
            txn = await cryptoFiat.buyCEURTokens(defaultOrder).should.be.fulfilled;
        });

        it('should be able to buy CUSD tokens', async function() {
            txn = await cryptoFiat.buyCUSDTokens(defaultOrder).should.be.fulfilled;
        });

        it('should increase the contract balance by 100% of investment value', async function() {
            
            let initialEtherSupply = web3.eth.getBalance(cryptoFiat.address);

            await OrderCUSD(cryptoFiat, defaultOrder);

            let etherSupply = web3.eth.getBalance(cryptoFiat.address);
            (etherSupply-initialEtherSupply).should.be.bignumber.equal(investment);
            
        });

        it('should increase the buffer by 0.5% of investment value', async function() {

            let initialBufferValue = await cryptoFiat.buffer.call();
            let bufferFee = getFee(1 * ether, 0.005);

            await OrderCUSD(cryptoFiat, defaultOrder);

            let bufferValue = await cryptoFiat.buffer.call();            
            (bufferValue-initialBufferValue).should.be.equal(bufferFee);

        });


        it('should increase the dividends pool by 0.5% of investment value', async function() {

            let initialDividends = await getDividends(cryptoFiat);
            let expectedDividends = initialDividends + getFee(investment, 0.005);
            

            await OrderCUSD(cryptoFiat, defaultOrder);
            let dividends = await getDividends(cryptoFiat);
            dividends.should.be.bignumber.equal(expectedDividends);
            
        });


        it('should increase total euro token supply by 99% of invested value', async function() {

            let initialTokenSupply = await getTotalSupply(CEURToken);
            let value = applyFee(investment, 0.01);

            await OrderCEUR(cryptoFiat, defaultOrder);

            let tokenSupply = await getTotalSupply(CEURToken);
            let expectedTokenSupply = Math.floor(initialTokenSupply + ETH_EUR * h.inEther(value));
            tokenSupply.should.be.equal(expectedTokenSupply);

        });


        it('should increase total dollar token supply by 99% of invested value', async function() {
            
            let initialTokenSupply = await getTotalSupply(CUSDToken);
            let amount = applyFee(investment, 0.01);
            
            await OrderCUSD(cryptoFiat, defaultOrder);

            let tokenSupply = await getTotalSupply(CUSDToken);
            let expectedTokenSupply = Math.floor(initialTokenSupply + ETH_USD * h.inEther(amount));
            tokenSupply.should.be.equal(expectedTokenSupply);

        });

        it('should increase the total crypto fiat value (USD) by 99% of invested value', async function() {

            let initialCryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);
            let expectedCryptoFiatIncrement = applyFee(investment, 0.01);
            
            await OrderCUSD(cryptoFiat, defaultOrder);

            let cryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);

            (cryptoFiatValue - initialCryptoFiatValue).should.be.equal(expectedCryptoFiatIncrement)

        });

        it('should increase the total crypto fiat value (EUR) by 99% of invested value', async function() {

            let initialCryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);
            let expectedCryptoFiatIncrement = applyFee(1 * ether, 0.01);
            
            await OrderCEUR(cryptoFiat, defaultOrder);

            let cryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);

            (cryptoFiatValue - initialCryptoFiatValue).should.be.equal(expectedCryptoFiatIncrement);

        });


        it('should increment CUSD token balance', async function() {

            let initialBalance = await getCUSDBalance(cryptoFiat, investor1);
            let amount = applyFee(investment, 0.01)
            let expectedBalance = Math.floor(initialBalance + ETH_USD * h.inEther(amount));

            await OrderCUSD(cryptoFiat, defaultOrder);

            let balance = await getCUSDBalance(cryptoFiat, investor1);
            balance.should.be.equal(expectedBalance);

        });


        it('should increment CEUR token balance', async function() {

            let amount = applyFee(investment, 0.01)
            let initialBalance = await getCEURBalance(cryptoFiat, investor1);
            let expectedBalance = Math.floor(initialBalance + ETH_EUR * h.inEther(amount));
            
            await OrderCEUR(cryptoFiat, defaultOrder);

            let balance = await getCEURBalance(cryptoFiat, investor1);
            balance.should.be.equal(expectedBalance);

        });

    });

    describe('Selling', function() {

        before(async function() {
            params = {from: investor1, value: investment, gas: 200000 }
            let conversionRates = await cryptoFiat.conversionRate.call();
            ETH_USD = conversionRates[0].toNumber();
            ETH_EUR = conversionRates[1].toNumber();

        });

        it('should be able to sell CEUR tokens', async function() {
            params = {from: investor1, gas: 200000}
            txn = await cryptoFiat.sellCEURTokens(10, params).should.be.fulfilled;
        });

        it('should be able to sell CUSD tokens', async function() {
            params = {from: investor1, gas: 200000}
            txn = await cryptoFiat.sellCUSDTokens(10, params).should.be.fulfilled;
        });

        it('10 CUSD tokens should decrease the total CUSD token balance by 10', async function() {

            let initialSupply = await getTotalCUSDSupply(cryptoFiat);
            await sellOrderCUSD(cryptoFiat, 10, investor1);
            let supply = await getTotalCUSDSupply(cryptoFiat);

            supply.should.be.equal(initialSupply - 10);

        });

        it('10 CEUR tokens should decrease the total CEUR token balance by 10', async function() {
            
            let initialSupply = await getTotalCEURSupply(cryptoFiat);
            await sellOrderCEUR(cryptoFiat, 10, investor1);
            let supply = await getTotalCEURSupply(cryptoFiat);

            supply.should.be.equal(initialSupply - 10);
            
        });
        
        it('10(,00) CUSD Tokens should decrease investor CUSD token balance by 10', async function() {
            
            let initialBalance = await getCUSDBalance(cryptoFiat, investor1);
            await sellOrderCUSD(cryptoFiat, 10, investor1);
            let balance = await getCUSDBalance(cryptoFiat, investor1);

            balance.should.be.equal(initialBalance - 10);

        });

        it('10(,00) CEUR Tokens should decrease investor CEUR token balance by 10', async function() {

            let initialBalance = await getCEURBalance(cryptoFiat, investor1);
            await sellOrderCEUR(cryptoFiat, 10, investor1);
            let balance = await getCEURBalance(cryptoFiat, investor1);

            balance.should.be.equal(initialBalance - 10);

        });

        it('10(,00) CUSD Tokens should correctly increase investor ether balance (USD)', async function() {

            let initialBalance = getBalance(investor1);
            let expectedIncrement = h.inEther(1000 * ether / ETH_USD);

            await sellOrderCUSD(cryptoFiat, 10 * tokenUnits, investor1);

            let balance = getBalance(investor1);
            let increment = h.inEther(balance - initialBalance);
            expect(increment).to.almost.equal(expectedIncrement,1);

        });

        it('10(,00) CEUR Tokens should correctly increase investor balance (EUR)', async function() {

            let initialBalance = getBalance(investor1);
            let expectedIncrement = h.inEther(1000 * ether / ETH_EUR);

            await sellOrderCEUR(cryptoFiat, 10 * tokenUnits, investor1);

            let balance = getBalance(investor1);
            let increment = h.inEther(balance - initialBalance);
            expect(increment).to.almost.equal(expectedIncrement, 1);
            

        });


        it('should payout around 0.39 ether for 10000 token base units (= 100,00 CEUR) ', async function() {

            let initialBalance = h.getBalanceInWei(investor1);
            let expectedBalanceIncrement = 10000 * ether / ETH_EUR;

            await sellOrderCEUR(cryptoFiat, 10000, investor1);

            let balance = h.getBalanceInWei(investor1);
            expect(h.inEther(balance-initialBalance)).to.almost.equal(h.inEther(expectedBalanceIncrement),3);
        });


        it('should payout around ether for 10000 token base units (= 100,00 CUSD) ', async function() {

            let initialBalance = h.getBalanceInWei(investor1);
            let expectedBalanceIncrement = 10000 * ether / ETH_USD;

            await sellOrderCUSD(cryptoFiat, 10000, investor1);

            let balance = h.getBalanceInWei(investor1);
            expect(h.inEther(balance-initialBalance)).to.almost.equal(h.inEther(expectedBalanceIncrement), 3);
        });
            
    });


    describe('Change conversion rates', function() {

        it('shoud be able to change USD conversion rate', async function() {
            let txnObj = {from: investor1, gas: gas};

            await setUSDConversionRate(cryptoFiat, 20000);

            let newConversionRate = await cryptoFiat.conversionRate.call();
            let ETH_USD = newConversionRate[0];

            ETH_USD.should.be.bignumber.equal(20000);

        });

        it('should be able to change EUR conversion rate', async function() {
            let txnObj = {from: investor1, gas: gas};

            await setEURConversionRate(cryptoFiat, 20000);

            let newConversionRate = await cryptoFiat.conversionRate.call();
            let ETH_EUR = newConversionRate[1];

            ETH_EUR.should.be.bignumber.equal(20000);

        })


    });


    describe('Total Crypto Fiat Value', function() {

        beforeEach(async function() {

            cryptoFiat = await CryptoFiat.new();
            CEURTokenAddress = await cryptoFiat.CEUR();
            CUSDTokenAddress = await cryptoFiat.CUSD();
            CUSDToken = CryptoDollarToken.at(CUSDTokenAddress);
            CEURToken = CryptoEuroToken.at(CEURTokenAddress);

            await setUSDConversionRate(cryptoFiat, 20000);
            await setEURConversionRate(cryptoFiat, 20000);

        });


        it('should be multiplied by two if the USD conversion rate is divided by two (CEUR = 0)', async function() {
            
            let order = {from: investor1, value: 10 ** 18, gas: 200000};
            
            await OrderCUSD(cryptoFiat, order);

            let conversionRate = await getUSDConversionRate(cryptoFiat);
            let newConversionRate = Math.floor(conversionRate / 2);
            let initialCryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);

            await setUSDConversionRate(cryptoFiat, newConversionRate);

            let cryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);
            cryptoFiatValue.should.be.equal(initialCryptoFiatValue * 2);
            
        });

        it('should be multiplied by two if the EUR conversion rate is multiplied by two (CUSD = 0)', async function() {

            let order = {from: investor1, value : 10 ** 18, gas: 200000 };

            await OrderCEUR(cryptoFiat, order);

            let conversionRate = await getEURConversionRate(cryptoFiat);
            let newConversionRate = Math.floor(conversionRate / 2);
            let initialCryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);

            await setEURConversionRate(cryptoFiat, newConversionRate);

            let cryptoFiatValue = await getTotalCryptoFiatValue(cryptoFiat);
            cryptoFiatValue.should.be.equal(initialCryptoFiatValue * 2);

        });
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

    //         let txnObj = {from: investor1, value: investment, gas: 200000}
    //         let initialBuffer = await getBuffer(cryptoFiat);
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCEUR(cryptoFiat, txnObj);

    //         let buffer = await getBuffer(cryptoFiat);
    //         expect(buffer).to.almost.equal(initialBuffer + fee);

    //     });

    //     it('should not change if CEUR tokens are bought', async function() {
            
    //         let txnObj = {from: investor1, value: investment, gas: 200000}
    //         let initialBuffer = await getBuffer(cryptoFiat);
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCEUR(cryptoFiat, txnObj);

    //         let buffer = await getBuffer(cryptoFiat);
    //         expect(buffer).to.almost.equal(initialBuffer + fee)

    //     });

    //     it('should be multiplied by two if the USD conversion rate is divided by two (and CEUR bucket - initial capital are zero)', async function() {

    //         let txnObj = {from: investor1, value: 10 ** 5, gas: 200000};
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCUSD(cryptoFiat, txnObj);

    //         let initialBuffer = await cryptoFiat.buffer.call();

    //         let newConversionRate = await getUSDConversionRate(cryptoFiat);
    //         newConversionRate = Math.floor(newConversionRate / 2);

    //         let totalBalance = await cryptoFiat.totalBalance.call();
    //         let totalCryptoFiatValue = await cryptoFiat.totalCryptoFiatValue.call();

    //         txn = await cryptoFiat.setUSDConversionRate(newConversionRate, {from: investor1, gas: 2000000 });
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

    //         let txnObj = {from: investor1, value: 10 ** 5, gas: 200000};
    //         let fee = 0.005 * 10 ** 18;

    //         await OrderCEUR(cryptoFiat, txnObj);

    //         let initialBuffer = await getBuffer(cryptoFiat);

    //         let newConversionRate = await getEURConversionRate(cryptoFiat) / 2;
    //         txn = await cryptoFiat.setEURConversionRate(newConversionRate, {from: investor1, gas: 2000000 });
    //         let txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
            
    //         let buffer = await getBuffer(cryptoFiat);
    //         expect(buffer).to.almost.equal(initialBuffer / 2);

    //     });

    // });


   
        

        


        // it('should increment dollar token balance', async function() {

        //     let initialUSDTokenBalance = await cryptoFiat.cryptoDollarBalance(investor1);
            
        //     txn = await cryptoFiat.buyCryptoDollarTokens(params);
        //     txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

        //     let USDTokenBalance = await cryptoFiat.cryptoDollarBalance(investor1);
                
        //     let dollarConversionRate = await cryptoFiat.dollarConversionRate.call();
        //     let expectedUSDTokenIncrement = dollarConversionRate * h.inEther(investment);

        //     (USDTokenBalance - initialUSDTokenBalance).should.be.equal(expectedUSDTokenIncrement);

        // });

        // it('should increment euro token balance', async function() {

        //     let initialEURTokenBalance = await cryptoFiat.cryptoEuroBalance(investor1);
            
        //     txn = await cryptoFiat.buyCryptoEuroTokens(params);
        //     txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

        //     let EURTokenBalance = await cryptoFiat.cryptoEuroBalance(investor1);
                
        //     let euroConversionRate = await cryptoFiat.euroConversionRate.call();
        //     let expectedEURTokenIncrement =  euroConversionRate * h.inEther(investment);
            
        //     (EURTokenBalance-initialEURTokenBalance).should.be.bignumber.equal(expectedEURTokenIncrement);

        // });




    // describe('Token Balance functionality', function() {

    //     before(function() {
    //         params = {from: investor1, value: investment, gas: 200000 }
    //         let cryptoDollarBalance;
    //         let cryptoEuroBalance;
    //     })

    //     it('should display euro token balance', async function() {
            

    //         let euroTokenBalance = await cryptoFiat.cryptoDollarBalance(investor1);
    //         euroTokenBalance = Number(euroTokenBalance.toString());
    //         euroTokenBalance.should.be.a('number');

    //     });

    //     it('should display dollar token balance', async function() {

    //         let dollarTokenBalance = await cryptoFiat.cryptoDollarBalance(investor1);
    //         dollarTokenBalance = Number(dollarTokenBalance.toString());
    //         dollarTokenBalance.should.be.a('number');

    //     });

        

    // })

    // describe('Sell tokens functionality', function() {

    //     beforeEach(async function() {

    //         params = {from: investor1, gasPrice: gasPrice }
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

    //         let initialinvestor1Balance = web3.eth.getBalance(investor1);
    //         txn = await cryptoFiat.sellCryptoDollarTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    //         let gasUsed = txnReceipt.gasUsed;

    //         let investor1Balance = web3.eth.getBalance(investor1);
    //         let balanceIncrement = Number(h.inEther(investor1Balance - initialinvestor1Balance));
    //         let expectedinvestor1BalanceIncrement =  (tokenAmount / ETH_USD_InCents) - h.inEther(gasUsed * gasPrice);

    //         expect(balanceIncrement).to.almost.equal(expectedinvestor1BalanceIncrement, 3)

    //     });

    //     it('should send expected amount of ether in exchange of crypto EUR tokens', async function() {

    //         let initialinvestor1Balance = web3.eth.getBalance(investor1);

    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
    //         let gasUsed = Number(txnReceipt.gasUsed);

    //         let investor1Balance = web3.eth.getBalance(investor1);
    //         let balanceIncrement = Number(h.inEther(investor1Balance - initialinvestor1Balance));
    //         let expectedBalanceIncrement =  (tokenAmount / ETH_EUR_InCents) - h.inEther(gasUsed * gasPrice);

    //         expect(balanceIncrement).to.almost.equal(expectedBalanceIncrement, 6)

    //     });

    //     it('should decrease the crypto USD sender balance', async function() {

    //         let initialCryptoUSDBalance = await cryptoFiat.cryptoDollarBalance(investor1);

    //         txn = await cryptoFiat.sellCryptoDollarTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);

    //         let cryptoUSDBalance = await cryptoFiat.cryptoDollarBalance(investor1);
    //         let tokenBalanceDecrement = initialCryptoUSDBalance.minus(cryptoUSDBalance);

    //         (tokenBalanceDecrement).should.be.bignumber.equal(tokenAmount)
    //     });


    //     it('should decrease the crypto EUR sender balance', async function() {
                
    //         let initialCryptoEURBalance = await cryptoFiat.cryptoEuroBalance(investor1);
    //         let tokenAmount = h.inCents(500);

    //         txn = await cryptoFiat.sellCryptoEuroTokens(tokenAmount, params);
    //         txnReceipt = await h.waitUntilTransactionsMined(txn.tx);
            
    //         let cryptoEURBalance = await cryptoFiat.cryptoEuroBalance(investor1);
    //         let tokenBalanceDecrement = initialCryptoEURBalance.minus(cryptoEURBalance);

    //         (tokenBalanceDecrement).should.be.bignumber.equal(tokenAmount);
            
    //     });




    // });

});
