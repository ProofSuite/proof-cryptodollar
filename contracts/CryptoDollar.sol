pragma solidity ^0.4.18;

import './interfaces/ERC20.sol';
import './libraries/SafeMath.sol';
import './utils/Ownable.sol';

import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';


contract CryptoDollar {
  using SafeMath for uint256;
  using CryptoDollarStorageProxy for address;
  using CryptoFiatStorageProxy for address;

  string public name = "CryptoDollar";
  string public symbol = "CUSD";
  uint8 public decimals = 2;

  function CryptoDollar() public {

  }

  function() public payable {
    revert();
  }

}