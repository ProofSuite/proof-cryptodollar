module.exports = function(cryptoFiat, cryptoEuroToken, cryptoDollarToken) {

    var module = {};

    module.getCryptoEuroSupply = async function() {
        let cryptoEuroSupply = await cryptoEuroToken.totalSupply.call();
        cryptoEuroSupply = Number(cryptoEuroSupply.toString());
    }


    module.getCryptoDollarSupply = async function() {
        let cryptoDollarSupply = await cryptoDollarToken.totalSupply.call();
        cryptoDollarSupply = Number(cryptoDollarSupply.toString());
        
    }


}


