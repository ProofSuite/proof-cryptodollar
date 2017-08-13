/// @title Proof Presale Token (PROOFP)
pragma solidity ^0.4.11;


import './SafeMath.sol';
import './Ownable.sol';
import './ERC20.sol';

/**
 * Standard ERC20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 * Based on code by FirstBlood:
 * https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */

/// @title Proof Presale Token (PROOFP)

contract CEURToken is ERC20, Ownable {

  using SafeMath for uint256;

  mapping(address => uint) balances;
  mapping (address => mapping (address => uint)) allowed;

  string public name = "Crypto EUR Token";
  string public symbol = "CEUR";
  uint8 public decimals = 2;
  bool public mintingFinished = false;
  uint256 public totalSupply = 0;

  function CEURToken() {}


  // TODO : need to replace throw by 0.4.11 solidity compiler syntax
  function() payable {
    revert();
  }

  function transfer(address _to, uint _value) public returns (bool success) {

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    return true;
  }

  function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
    var _allowance = allowed[_from][msg.sender];

    balances[_to] = balances[_to].add(_value);
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = _allowance.sub(_value);

    return true;
  }

  function balanceOf(address _owner) public constant returns (uint balance) {
    return balances[_owner];
  }

  function approve(address _spender, uint _value) public returns (bool success) {
    allowed[msg.sender][_spender] = _value;
    return true;
  }

  function allowance(address _owner, address _spender) public constant returns (uint remaining) {
    return allowed[_owner][_spender];
  }
    
    
  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  /**
   * Function to buy tokens from token contract owner
   * @param _to The address that will recieve the created tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */

  function buy(address _to, uint256 _amount) onlyOwner canMint returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    return true;
  }


  /**
   * Function to buy tokens from token contract owner
   * @param _to The address that is selling the tokens
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */

  function sell(address _to, uint256 _amount) onlyOwner returns (bool) {
      totalSupply = totalSupply.sub(_amount);
      balances[_to] = balances[_to].sub(_amount);
      return true;
  }
  
}


