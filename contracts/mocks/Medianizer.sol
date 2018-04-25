pragma solidity ^0.4.19;

contract Medianizer {

  uint256 exchangeRate;

  function Medianizer(uint256 _exchangeRate) public {
    exchangeRate = _exchangeRate;
  }

  function setExchangeRate(uint256 _exchangeRate) public {
    exchangeRate = _exchangeRate;
  }

  function peek() public view returns(bytes32, bool)
  {
      bytes32 exchangeRateInBytes = bytes32(exchangeRate);
      return (exchangeRateInBytes, true);
  }
}