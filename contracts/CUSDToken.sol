pragma solidity ^0.4.11;


import './SafeMath.sol';
import './Ownable.sol';
import './ERC20.sol';


/**
 * @title CUSDToken
 * @author Proof - David Van Isacker
 * @notice CUSDToken is based on the ERC20 standard token. The CUSDToken is augmented with logic to keep track of the 
 * initial ether investment. This initial ether investment represents the total ether value accountable to the 
 * token holder in the event the cryptoFiat contract becomes unpegged
 */
contract CUSDToken is ERC20, Ownable {

  using SafeMath for uint256;

  mapping(address => uint) balances;
  mapping(address => uint) guaranteedEther;
  mapping (address => mapping (address => uint)) allowed;

  string public name = "Crypto USD Token";
  string public symbol = "CUSD";
  uint8 public decimals = 2;
  bool public mintingFinished = false;
  uint256 public totalSupply = 0;

  function CUSDToken() {}


  function() payable {
    revert();
  }

  /**
  * @param _to is the token receiver
  * @param _value is the amount of tokens transferred
  * @returns _success if the transaction is successful
  */
  function transfer(address _to, uint _value) public returns (bool success) {

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);

    uint256 etherValue = guaranteedEther[msg.sender].mul(_value).div(balances[msg.sender]);
    guaranteedEther[msg.sender] = guaranteedEther[msg.sender].sub(etherValue);
    guaranteedEther[_to] = guaranteedEther[_to].add(etherValue);

    return true;
  }

  /**
  * @param _from is the token holder allowing to the token receiver _to
  * @param _to is the token receiver 
  * @param _value is the amount of tokens transferred
  * @returns _success is the transaction is successful
  */
  function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
    var _allowance = allowed[_from][msg.sender];

    balances[_to] = balances[_to].add(_value);
    balances[_from] = balances[_from].sub(_value);

    uint256 etherValue = guaranteedEther[msg.sender].mul(_value).div(balances[msg.sender]);
    guaranteedEther[_to] = guaranteedEther[_to].add(etherValue);
    guaranteedEther[_from] = guaranteedEther[_from].sub(etherValue);

    allowed[_from][msg.sender] = _allowance.sub(_value);

    return true;
  }

  /**
  * @param _owner is the token holder
  * @returns balance
  */
  function balanceOf(address _owner) public constant returns (uint balance) {
    return balances[_owner];
  }

  /**
  * @param _owner is the token holder
  * @returns _value is the guaranteed ether for _owner in the event the contract becomes unpegged
  */
  function reservedEther(address _owner) public constant returns (uint value) {
    return guaranteedEther[_owner];
  }


  /**
  * @param _spender is allowed a portion of the msg.sender balance
  * @param _value is the amount spendable via the transferFrom function
  * @returns success if the function call is successful
  */
  function approve(address _spender, uint _value) public returns (bool success) {
    allowed[msg.sender][_spender] = _value;
    return true;
  }

  /**
   * @param _owner is the token holder
   * @param _spender
   * @returns the amount of tokens allowed by _owner to _spender
   */
  function allowance(address _owner, address _spender) public constant returns (uint remaining) {
    return allowed[_owner][_spender];
  }
    
    
  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  /**
   * @param _to The address that will recieve the created tokens.
   * @param _amount The amount of tokens to mint.
   * @param _etherValue The ether value that will be guaranteed to the token buyer in the event the contract becomes unpegged
   * @return A boolean that indicates if the operation was successful.
   */
  function buy(address _to, uint256 _amount, uint256 _etherValue) onlyOwner canMint returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    guaranteedEther[_to] = guaranteedEther[_to].add(_etherValue);
    return true;
  }


  /**
   * @param _to The address that is selling the tokens
   * @param _amount The amount of tokens to mint.
   * @param _etherValue The ether value that will subtracted from the token seller guaranteed ether in the event the contract becomes unpegged
   * @return A boolean that indicates if the operation was successful.
   */
  function sell(address _to, uint256 _amount, uint256 _etherValue) onlyOwner returns (bool) {
      totalSupply = totalSupply.sub(_amount);
      balances[_to] = balances[_to].sub(_amount);
      guaranteedEther[_to] = guaranteedEther[_to].sub(_etherValue);
      return true;
  }
  
}


