pragma solidity ^0.4.19;

import "./utils/usingOraclize.sol";
import "./interfaces/CryptoFiatHubInterface.sol";
import './utils/Logger.sol';

contract PriceFeed is usingOraclize, Logger {

    string public ipfsHash ;

    CryptoFiatHubInterface public cryptoFiatHub;
    mapping (bytes32 => address) private callingAddress;
    mapping (bytes32 => uint256) private callingValue;
    mapping (bytes32 => Func) private callingFunction;

    enum Func { Buy, Sell, SellUnpegged }

    function PriceFeed(string _ipfsHash) public {
      OAR = OraclizeAddrResolverI(0xE40bc930e954d9CdBae7122F94eE88B1F3472C31);  // only test mode
      oraclize_setProof(proofType_NONE); // oraclize_setProof(proofType_TLSNotary);
      ipfsHash = _ipfsHash;
    }

    function setCryptoFiatHub(address _cryptoFiatHub) public {
      cryptoFiatHub = CryptoFiatHubInterface(_cryptoFiatHub);
    }

    function getRate(address _sender, uint256 _value, Func _func) public payable {
      // need to update the authorization system to include
      // uint256 oraclizeFee = ;
      // require(oraclizeFee <= this.balance);
      // printNumber("oraclizeFee", oraclizeFee);

      bytes32 queryId = oraclize_query("computation", [ipfsHash]);
      callingAddress[queryId] = _sender;
      callingValue[queryId] = _value - oraclize_getPrice("computation");
      callingFunction[queryId] = _func;
    }

    function __callback(bytes32 queryId, string result) public {
      require(msg.sender == oraclize_cbAddress());
      uint256 exchangeRate = parseInt(result);

      if (callingFunction[queryId] == Func.Buy) {
        cryptoFiatHub.buyCryptoDollarCallback(exchangeRate, callingAddress[queryId], callingValue[queryId]);
      } else if (callingFunction[queryId] == Func.Sell) {
        cryptoFiatHub.sellCryptoDollarCallback(exchangeRate, callingAddress[queryId], callingValue[queryId]);
      } else {
        cryptoFiatHub.sellUnpeggedCryptoDollarCallback(exchangeRate, callingAddress[queryId], callingValue[queryId]);
      }
    }
}