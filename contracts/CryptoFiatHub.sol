pragma solidity ^0.4.18;

import './libraries/SafeMath.sol';
import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';
import './interfaces/ProofTokenInterface.sol';
import './interfaces/StoreInterface.sol';
import './interfaces/ProofRewardsInterface.sol';
import './interfaces/CryptoDollarInterface.sol';



contract CryptoFiatHub {
  using SafeMath for uint256;
  using CryptoFiatStorageProxy for address;


  CryptoDollarInterface public cryptoDollar;
  ProofTokenInterface public proofToken;
  ProofRewardsInterface public proofRewards;
  uint256 pointMultiplier = 10 ** 18;
  address public store;
  uint256 public exchangeRate;


  function CryptoFiatHub(address _cryptoDollarAddress, address _storeAddress, address _proofTokenAddress) public {
    cryptoDollar = CryptoDollarInterface(_cryptoDollarAddress);
    proofToken = ProofTokenInterface(_proofTokenAddress);
    store = _storeAddress;
    exchangeRate = 25000;

    uint256 initialBlockNumber = block.number;
    store.setCreationBlockNumber(initialBlockNumber);
  }

}