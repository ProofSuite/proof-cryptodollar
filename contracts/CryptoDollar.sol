pragma solidity ^0.4.19;

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

  function CryptoDollar(address _storeAddress)
  public
  {
    store = _storeAddress;
  }

  function()
  public
  payable
  {
    revert();
  }


  /**
  * Standard ERC20 transfer tokens function
  * @param _to {address}
  * @param _amount {uint256}
  * @return success {bool}
  */
  function transfer(address _to, uint256 _amount)
  public
  returns (bool success)
  {
    uint256 senderReservedEther = store.getReservedEther(msg.sender);
    uint256 senderBalance = store.getBalance(msg.sender);
    uint256 etherValue = senderReservedEther.mul(_amount).div(senderBalance);

    require(senderBalance >= _amount);

    store.decrementBalance(msg.sender, _amount);
    store.incrementBalance(_to, _amount);
    store.decrementReservedEther(msg.sender, etherValue);
    store.incrementReservedEther(_to, etherValue);
    return true;
  }

  /**
  * Standard ERC20 transferFrom function
  * @param _from {address}
  * @param _to {address}
  * @param _amount {uint256}
  * @return success {bool}
  */
  function transferFrom(address _from, address _to, uint256 _amount)
  public
  returns (bool success)
  {
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

  /**
  * Standard ERC20 approve function
  * @param _spender {address}
  * @param _amount {uint256}
  * @return success {bool}
  */
  function approve(address _spender, uint256 _amount)
  public
  returns (bool success)
  {
    store.setAllowance(msg.sender, _spender, _amount);
    return true;
  }

  /**
  * Standard ERC20 allowance function
  * @param _owner {address}
  * @param _spender {address}
  * @return remaining {uint256}
  */
  function allowance(address _owner, address _spender)
  public
  constant returns (uint256)
  {
    return store.getAllowance(_owner, _spender);
  }


  /**
   @notice mints _amount tokens for _to and reserves _etherValue of ether
   @param _to {address} - Address receiving CryptoDollar tokens
   @param _amount {uint256} - Amount of minted CryptoDollar tokens
   @param _etherValue {uint256} - Amount of ether that will be added to the receiver's reserved ether
   @return {bool} - True if the transaction is completed successfully
   */
  function buy(address _to, uint256 _amount, uint256 _etherValue)
  public
  onlyAuthorized
  returns (bool)
  {
    store.incrementTotalSupply(_amount);
    store.incrementBalance(_to, _amount);
    store.incrementReservedEther(_to, _etherValue);
    return true;
  }

  /**
   @notice burns _amount tokens and removes _etherValue of ether for _to
   @param _to {address} - Address receiving CryptoDollar tokens
   @param _amount {uint256} - Amount of minted CryptoDollar tokens
   @param _etherValue {uint256} - Amount of ether that will be removed from the receiver's reserved ether
   @return True if the transaction is completed successfully
   */
  function sell(address _to, uint256 _amount, uint256 _etherValue)
  public
  onlyAuthorized
  returns (bool)
  {
    store.decrementTotalSupply(_amount);
    store.decrementBalance(_to, _amount);
    store.decrementReservedEther(_to, _etherValue);
    return true;
  }

  /**
   @notice Returns the cryptodollar total supply via the storage contract
   @return CryptoDollar {uint256} - Total supply
   */
  function totalSupply()
  public
  view
  returns (uint256)
  {
    return store.getTotalSupply();
  }

  /**
  @notice Returns _owner CryptoDollar token balance via the storage contract
  @param _owner {address} - Address of CryptoDollar token owner
  @return CryptoDollar {uint256} tokens balance of _owner
   */
  function balanceOf(address _owner)
  public
  constant
  returns(uint256 balance)
  {
    return store.getBalance(_owner);
  }

  /**
  @notice Returns _owner Reserved ether balance by calling the storage contract
  @param _owner {address} - Address of CryptoDollar token owner
  @return {uint256} - Ether value reserved for _owner
   */
  function reservedEther(address _owner)
  public
  constant
  returns(uint256 value)
  {
    return store.getReservedEther(_owner);
  }

}