pragma solidity ^0.4.18;

import './interfaces/ERC20.sol';
import './libraries/SafeMath.sol';
import './utils/Ownable.sol';
import './utils/Secured.sol';

import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';


contract CryptoDollar is Secured {
  using SafeMath for uint256;
  using CryptoDollarStorageProxy for address;
  using CryptoFiatStorageProxy for address;

  string public name = "CryptoDollar";
  string public symbol = "CUSD";
  uint8 public decimals = 2;
  address public store;

  function CryptoDollar(address _storeAddress) public {
    store = _storeAddress;
  }

  function() public payable {
    revert();
  }

  function transfer(address _to, uint _amount) public returns (bool success) {
    uint256 senderReservedEther = store.getReservedEther(msg.sender);
    uint256 senderBalance = store.getBalance(msg.sender);
    //TODO validate this is the appropriate and desired formula
    uint256 etherValue = senderReservedEther.mul(_amount).div(senderBalance);

    require(senderBalance >= _amount);

    store.decrementBalance(msg.sender, _amount);
    store.incrementBalance(_to, _amount);
    store.decrementReservedEther(msg.sender, etherValue);
    store.incrementReservedEther(_to, etherValue);
    return true;
  }


  function transferFrom(address _from, address _to, uint _amount) public returns (bool success) {
    uint256 senderReservedEther = store.getReservedEther(_from);
    uint256 senderBalance = store.getBalance(_from);
    uint256 etherValue = senderReservedEther.mul(_amount).div(senderBalance);

    require(senderBalance >= _amount);

    store.incrementBalance(_to, _amount);
    store.decrementBalance(_from, _amount);
    store.decrementReservedEther(_from, etherValue);
    store.incrementReservedEther(_to, etherValue);
    store.decrementAllowance(_from, _to, _amount);
    return true;
  }


  function approve(address _spender, uint _value) public returns (bool success) {
    store.setAllowance(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender) public constant returns (uint256) {
    return store.getAllowance(_owner, _spender);
  }


  /**
   @notice mints _amount tokens for _to and reserves _etherValue of ether
   @param _to Address receiving CryptoDollar tokens
   @param _amount Amount of minted CryptoDollar tokens
   @param _etherValue Amount of ether that will be added to the receiver's reserved ether
   @return True if the transaction is completed successfully
   */
  function buy(address _to, uint256 _amount, uint256 _etherValue) public onlyAuthorized returns (bool) {
    store.incrementTotalSupply(_amount);
    store.incrementBalance(_to, _amount);
    store.incrementReservedEther(_to, _etherValue);
    return true;
  }

  /**
   @notice burns _amount tokens and removes _etherValue of ether for _to
   @param _to Address receiving CryptoDollar tokens
   @param _amount Amount of minted CryptoDollar tokens
   @param _etherValue Amount of ether that will be removed from the receiver's reserved ether
   @return True if the transaction is completed successfully
   */
  function sell(address _to, uint256 _amount, uint256 _etherValue) public onlyAuthorized returns (bool) {
    store.decrementTotalSupply(_amount);
    store.decrementBalance(_to, _amount);
    store.decrementReservedEther(_to, _etherValue);
    return true;
  }

  /**
   @notice Returns the cryptodollar total supply via the storage contract
   @return CryptoDollar total supply
   */
  function totalSupply() public view returns (uint256) {
    return store.getTotalSupply();
  }

  /**
  @notice Returns _owner CryptoDollar token balance via the storage contract
  @param _owner Address of CryptoDollar token owner
  @return CryptoDollar tokens balance of _owner
   */
  function balanceOf(address _owner) public constant returns(uint balance) {
    return store.getBalance(_owner);
  }

  /**
  @notice Returns _owner Reserved ether balance by calling the storage contract
  @param _owner Address of CryptoDollar token owner
  @return Ether value reserved for _owner
   */
  function reservedEther(address _owner) public constant returns(uint value) {
    return store.getReservedEther(_owner);
  }

}