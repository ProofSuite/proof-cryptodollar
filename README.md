
# Proof Crypto Fiat
Official Repository for the Proof Crypto Fiat project


[![Build Status](https://travis-ci.org/ProofSuite/ProofCryptoFiat.svg?branch=develop)](https://travis-ci.org/ProofSuite/ProofCryptoFiat)
[![Code Coverage](https://codecov.io/gh/ProofSuite/ProofCryptoFiat/branch/develop/graph/badge.svg)](https://codecov.io/gh/ProofSuite/ProofCryptoFiat)


## Contracts

The CryptoFiat system is being built with the intent to provide cryptocurrency users with an option to buy tokens that are pegged to traditional currencies such as the US Dollar or the Euro. Solutions such as the cryptocurrency Tether focus on solving this issue by pegging their currency to dollars and storing physical dollars in a vault. This requires Tether holders to trust a centralized organization, which is at odds with the principles of trustless transactions.

The CryptoFiat aims at providing an decentralized alternative to this problem. The contract will be initially capitalized with a large amount of ether. In addition to this initial seed, the CryptoFiat smart-contract will receive commissions from other smart-contracts in the Proof ecosystem.


In the event the amount of ether in the smart-contract is insufficient to maintain the pegging of the Cryptodollar, the CryptoFiat contract is designed to guarantee Cryptodollar token holders the amount of ether they initially sent to the smart-contract.

The Cryptodollar token has an ERC20 interface. The CryptoDollar can be bought via the CryptoFiatHub smart-contract which deals with the buy/sell logic.
To ensure upgradeability of the system, the smart-contract system uses a key/value storage system. The key/value pairs in the storage contract can be updated via the storage proxy libraries which provide helper functions.
Although currently not implemented, an upcoming version of this smart-contract infrastructure will enforce which contracts are controlling and controlled by each other.



## Development and Testing Environment Setup

### Requirements :
- OSX or Linux (Windows setup is likely possible but not covered in this guide)
- Node (version 8.9.4 recommended)
- Solidity Compiler (version 0.4.18 or other)
- Ganache-cli (v6.0.3)


### Testing Environment Setup :

- Clone the repository and install dependencies

```
git clone https://github.com/ProofSuite/ProofCryptoFiat.git
cd ProofCryptoFiat
npm install
```

- Install the latest version of truffle (Truffle v4.0.6)


```
npm install -g truffle
```

- Compile contracts
```
truffle compile
```

- Initialize testrpc (or geth)

```
./start_rpc.sh
```

- Migrate contracts to chosen network

```
truffle migrate --network development
```

- Make sure you are using the latest version of node

```
nvm install 8.9.4
nvm use 8.9.4
```


- Fill in `truffle.js` and `deploy_contracts.js` with appropriate wallet addresses. Unlock the corresponding addresses.

- Verify all tests are passing.

You need to re-migrate all contracts before running the test suite

```
truffle migrate --reset && truffle test
```

- You can interact with the contracts via the console

```
truffle console
```


- You can watch for changes on the fileystem with:

```
npm run watch
```

- Lint

```
npm run lint
```

- Run code coverage



```
npm run coverage
```

- Run tests for computation scripts (Oraclize)

```
npm run test-computation-script
```

Some tests will be failing on code coverage as the solidity coverage tool instruments contracts and breaks some of the tests
by adding an additional amount of gas. Currently there does not seem to be any workaround for this.


## Debugging (with vs-code)

Start the debugger listener
node --inspect-brk $(which truffle) test ./file/name.js


VS-code
Select the "Node Attach" process and add the following snippet to your launch.json file:
{
    "type": "node",
    "request": "attach",
    "name": "Attach",
    "port": 9229
}


## Front-end Test Application

To help testing the cryptodollar contract, a front-end react application is provided. The front-end requires a
different setup that can be found at the following repository: https://github.com/ProofSuite/private-geth-chain.
Download this repository in a different directory and complete the following setup.

To use the front-end test application for the cryptofiat contract, first create a private blockchain.

```
./create_geth_dev.sh
```

Start a node on the private blockchain

```
./start_geth_dev.sh
```

On a different terminal instance attach a geth process to the current to your running node

```
geth attach /path/to/geth.ipc
```

(Note: The IPC path is displayed on the logs when starting the node)

In the console, you can now download javascript utility functions and use them to manage your private chain.

```
loadScript('setup-accounts.js')
loadScript('unlock-accounts.js')
loadScript('allocate-ether.js')
```

You can start mining or stop mining with the following commands:

```
miner.start(4)
miner.stop()
```

After mining a sufficient amount of ether, you can allocate ether in order to be able to deploy the Oraclize contract
(see below).

```
allocateEther()
```

Occasionally you will need to unlock accounts

```
unlockAccounts()
```

After setting up your private chain correctly, instantiate the testnet oraclize service.
From the ProofCryptoFiat folder:

```
cd ethereum-bridge
npm install ethereum-bridge
node bridge -H localhost:8545 -a 1 --dev --update-ds
```

Write down the Oraclize Address Resolver Address (OAR) and insert it in the CryptoFiatHub contract.
Compile and migrate the CryptoFiat contracts on the development_geth network.

```
truffle compile --all
truffle migrate --reset --network development_geth
```


## Contribution

Thank you for considering helping the Proof project !

To make the Proof project truely revolutionary, we need and accept contributions from anyone and are grateful even for the smallest fixes.

If you want to help Proof, please fork and setup the development environment of the appropriate repository.
In the case you want to submit substantial changes, please get in touch with our development team on our slack channel (slack.proofsuite.com) to
verify those modifications are in line with the general goal of the project and receive early feedback. Otherwise you are welcome to fix, commit and
send a pull request for the maintainers to review and merge into the main code base.

Please make sure your contributions adhere to our coding guidelines:

- Code must adhere as much as possible to standard conventions (DRY - Separation of concerns - Modular)
- Pull requests need to be based and opened against the master branch
- Commit messages should properly describe the code modified
- Ensure all tests are passing before submitting a pull request

## License

The Proof CryptoFiat smart contract (i.e. all code inside of the contracts and test directories) is licensed under the MIT License, also included in our repository in the
LICENSE file.




