pragma solidity ^0.4.18;

import "../interfaces/StoreInterface.sol";


library DividendProxyLib {

  /**
  * @notice Dividends functions can only be called through the proof network
  * @notice In its current form, the proof network consists of the Cryptofiat and the AMP Manager contracts
  * @dev Implement the onlyAuthorized function when writing the ownership model
   */
  modifier onlyAuthorized() {
    _;
  }

  //getters
  function getCurrentPoolIndex(address _store) public view returns(uint256) {
    return StoreInterface(_store).getUint(keccak256("dividends.currentPoolIndex"));
  }

  function getCurrentEpoch(address _store) public view returns(uint256) {
    return StoreInterface(_store).getUint(keccak256("dividends.currentEpoch"));
  }

  function getCurrentPoolBalance(address _store) public view returns(uint256) {
    return StoreInterface(_store).getUint(keccak256("dividends.currentPoolBalance"));
  }

  function getNthPoolDividends(address _store, uint256 _index) public view returns(uint256) {
    return StoreInterface(_store).getUint(keccak256("dividends.nthPoolBalance", _index));
  }

  function getNthPoolRemainingDividends(address _store, uint256 _index) public view returns(uint256) {
    return StoreInterface(_store).getUint(keccak256("dividends.nthPoolRemainingBalance", _index));
  }

  function getAccountLastWithdrawal(address _store, address _account) public view returns(uint256) {
      return StoreInterface(_store).getUint(keccak256("dividends.accounts.lastWithdrawal", _account));
  }



  //setters
  function setCurrentPoolIndex(address _store, uint256 _value) public onlyAuthorized {
    StoreInterface(_store).setUint(keccak256("dividends.currentPoolIndex"), _value);
  }

  function setCurrentEpoch(address _store, uint256 _value) public onlyAuthorized {
    StoreInterface(_store).setUint(keccak256("dividends.currentEpoch"), _value);
  }

  function setCurrentPoolBalance(address _store, uint256 _value) public onlyAuthorized {
    StoreInterface(_store).setUint(keccak256("dividends.currentPoolBalance"), _value);
  }

  function setNthPoolDividends(address _store, uint256 _index, uint256 _value) public onlyAuthorized {
    StoreInterface(_store).setUint(keccak256("dividends.nthPoolBalance", _index), _value);
  }

  function setNthPoolRemainingDividends(address _store, uint256 _index, uint256 _value) public onlyAuthorized {
    StoreInterface(_store).setUint(keccak256("dividends.nthPoolRemainingBalance", _index), _value);
  }

  function setAccountLastWithdrawal(address _store, address _account, uint256 _value) public onlyAuthorized {
    StoreInterface(_store).setUint(keccak256("dividends.accounts.lastWithdrawal", _account), _value);
  }


  //helpers
  function incrementCurrentPoolIndex(address _store, uint256 _amount) public onlyAuthorized {
    uint256 newValue = StoreInterface(_store).getUint(keccak256("dividends.currentPoolIndex")) + _amount;
    StoreInterface(_store).setUint(keccak256("dividends.currentPoolIndex"), newValue);
  }

  function incrementCurrentEpoch(address _store, uint256 _amount) public onlyAuthorized {
    uint256 newValue = StoreInterface(_store).getUint(keccak256("dividends.currentEpoch")) + _amount;
    StoreInterface(_store).setUint(keccak256("dividends.currentEpoch"), newValue);
  }

  function incrementCurrentPoolBalance(address _store, uint256 _amount) public {
    uint256 newValue = StoreInterface(_store).getUint(keccak256("dividends.currentPoolBalance")) + _amount;
    StoreInterface(_store).setUint(keccak256("dividends.currentPoolBalance"), newValue);
  }
}