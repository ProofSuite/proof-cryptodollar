let txHash1 = await cryptoFiat.buyCryptoEuroTokens({from: web3.eth.accounts[1], value: 10000, gas: 200000})
let txHash2 = await cryptoFiat.buyCryptoDollarTokens({from: web3.eth.accounts[2], value: 100000, gas: 200000})

CEuroAddress = await cryptoFiat.cryptoEuroToken.call()
c_euro_contract = await cryptoDollarContract.at(CEuroAddress)

CDollarAddress = await cryptoFiat.cryptoDollarToken.call()
CDollarContract = await cryptoDollarContract.at(CDollarAddress)

CEuroAddress = await cryptoFiat.cryptoEuroToken.call()
CEuroContract = await cryptoEuroContract.at(CEuroAddress)



await c_euro_contract.balanceOf(web3.eth.accounts[1])

let tx_hash = await cryptoFiat.sellCryptoEuroTokens(5000, {from: web3.eth.accounts[1]})