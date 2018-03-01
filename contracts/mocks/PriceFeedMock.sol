pragma solidity ^0.4.19;

import "../utils/usingOraclize.sol";
import "../interfaces/CryptoFiatHubInterface.sol";

contract PriceFeedMock is usingOraclize {

  uint256 public exchangeRate;
  uint256 public oraclizeFee;
  CryptoFiatHubInterface cryptoFiatHub;

  enum Function { Buy, Sell, SellUnpegged }

  function PriceFeedMock(uint256 _exchangeRate, uint256 _oraclizeFee) public {
    exchangeRate = _exchangeRate;
    oraclizeFee = _oraclizeFee;
  }

  function setCryptoFiatHub(address _cryptoFiatHub) public {
    cryptoFiatHub = CryptoFiatHubInterface(_cryptoFiatHub);
  }

  function setExchangeRate(uint256 _exchangeRate) public {
    exchangeRate = _exchangeRate;
  }

  function setOraclizeFee(uint256 _oraclizeFee) public {
    oraclizeFee = _oraclizeFee;
  }

  function getRate(address _sender, uint256 _value, Function _func) public payable {
    require(msg.sender == address(cryptoFiatHub));

    if(_func == Function.Buy) {
      cryptoFiatHub.buyCryptoDollarCallback(exchangeRate, _sender, _value);
    } else if (_func == Function.Sell) {
      cryptoFiatHub.sellCryptoDollarCallback(exchangeRate, _sender, _value);
    } else {
      cryptoFiatHub.sellUnpeggedCryptoDollarCallback(exchangeRate, _sender, _value);
    }
  }

}