pragma solidity ^0.4.19;

contract Logger {

  event PrintNumber(string _message, uint256 _value);
  event PrintAddress(string _message, address _value);
  event PrintString(string _message, string _value);
  event PrintBoolean(string _message, bool _value);

  /**
   * This smart-contract can be used for debugging/logging purposes.
   * Simply import the Logger contract and print values in the truffle
   * testing terminal by calling Logger.printNumber(...)
   * You can provide a _message to describe the _value you are logging.
   */
  function Logger() public {

  }

  function printNumber(string _message, uint256 _value) public {
    PrintNumber(_message, _value);
  }

  function printAddress(string _message, address _value) public {
    PrintAddress(_message, _value);
  }

  function printString(string _message, string _value) public {
    PrintString(_message, _value);
  }

  function printBoolean(string _message, bool _value) public {
    PrintBoolean(_message, _value);
  }

}