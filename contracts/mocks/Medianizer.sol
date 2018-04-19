pragma solidity ^0.4.19;

contract Medianizer {

  uint256 exchangeRate;

  function Medianizer(uint256 _exchangeRate) public {
    exchangeRate = _exchangeRate;
  }

  function setExchangeRate(uint256 _exchangeRate) public {
    exchangeRate = _exchangeRate;
  }

  function compute() public view returns(uint256, bool)
  {
      return (exchangeRate, true);
  }
}