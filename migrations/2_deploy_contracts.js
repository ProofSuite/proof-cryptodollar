var Promise = require('bluebird');

var CEURToken = artifacts.require('./CEURToken.sol');
var CUSDToken = artifacts.require('./CUSDToken.sol');
var CryptoFiat = artifacts.require('./CryptoFiat.sol');
var ProofToken = artifacts.require('./ProofToken.sol')
var SafeMath = artifacts.require('./SafeMath.sol');

var tokens = [CUSDToken, CEURToken, ProofToken];

let defaultGas = 4712388;
let defaultGasPrice = 1000000000;

module.exports = function(deployer, network, accounts) {


  if (network == "development") {

    deployer.deploy(SafeMath, {gas: defaultGas, gasPrice: defaultGasPrice });
    deployer.link(SafeMath, CryptoFiat);
    deployer.link(SafeMath, CUSDToken);
    deployer.link(SafeMath, CEURToken);
    deployer.link(SafeMath, ProofToken);

    Promise.map(tokens, function(token) {
      return deployer.deploy(token);
    }).then(function() {

      deployer.deploy(CryptoFiat, 
                      CUSDToken.address, 
                      CEURToken.address, 
                      ProofToken.address,
                      {gas: defaultGas, gasPrice: defaultGasPrice});
    });

  }
  
};


// var ENS = artifacts.require("ens/ENS.sol");
// var MyContract = artifacts.require("MyContract.sol");

// module.exports = function(deployer) {
//   // Only deploy ENS if there's not already an address already.
//   // i.e., don't deploy if we're using the canonical ENS address,
//   // but do deploy it if we're on a test network and ENS doesn't exist.
//   deployer.deploy(ENS, {overwrite: false}).then(function() {
//     return deployer.deploy(MyContract, ENS.address);
//   });
// };


// module.exports = function(deployer, network) {
//   if (network == "live") {
//     // Do something specific to the network named "live".
//   } else {
//     // Perform a different step otherwise.
//   }
// }

// Deploy a single contract with constructor arguments
// deployer.deploy(A, arg1, arg2, ...);

// For this example, our dependency provides an address when we're deploying to the
// live network, but not for any other networks like testing and development.
// When we're deploying to the live network we want it to use that address, but in
// testing and development we need to deploy a version of our own. Instead of writing
// a bunch of conditionals, we can simply use the `overwrite` key.
// deployer.deploy(SomeDependency, {overwrite: false});