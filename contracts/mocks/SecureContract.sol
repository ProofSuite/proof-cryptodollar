pragma solidity ^0.4.19;

import "../utils/Secured.sol";


contract SecureContract is Secured {

  bool public a;

  function SecureContract() public {

  }

  function get() public view returns (bool) {
    return a;
  }

  function set(bool _value) public onlyAuthorized {
    a = _value;
  }


}

