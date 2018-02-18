pragma solidity ^0.4.18;

import "./Ownable.sol";


contract Secured is Ownable {

  address[] public authorized;
  mapping(address => bool) public isAuthorized;
  bool public authorizationsLocked;


  function Secured() public {

  }


  modifier notNull() {
    require(msg.sender != 0x0);
    _;
  }

  modifier onlyAuthorized {
    require(isAuthorized[msg.sender]);
    _;
  }

  modifier notLocked {
    require(!authorizationsLocked);
    _;
  }


  function authorizeAccess(address _address) public onlyOwner notNull notLocked {
    isAuthorized[_address] = true;
    authorized.push(_address);
  }

  function revokeAccess(address _address) public onlyOwner notNull notLocked {
    isAuthorized[_address] = false;
    for (uint i = 0; i < authorized.length - 1; i++) {
      if (authorized[i] == _address) {
        authorized[i] = authorized[authorized.length - 1];
        break;
      }
      authorized.length -= 1;
    }
  }

  function replaceAccess(address _address, address _newAddress) public onlyOwner notNull notLocked {
    for (uint i = 0; i < authorized.length; i++) {
      if (authorized[i] == _address) {
          authorized[i] = _newAddress;
          break;
      }
    }
    isAuthorized[_address] = false;
    isAuthorized[_newAddress] = true;
  }

  function getAuthorizations() public constant returns(address[]) {
    return authorized;
  }

  function lockAuthorizations() public onlyOwner returns(bool success) {
    authorizationsLocked = true;
    return true;
  }

}