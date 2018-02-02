pragma solidity 0.4.18;

import "./ERC20.sol";
import "../utils/Ownable.sol";

contract CryptoDollarInterface is ERC20, Ownable {

    function transfer(address _to, uint _value) public returns(bool success);
    function transferFrom(address _from, address _to, uint _value) public returns(bool success);
    function balanceOf(address _owner) public constant returns(uint256 balance);
    function reservedEther(address _owner) public constant returns(uint value);
    function approve(address _spender, uint _value) public returns (bool success);
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining);
    function buy(address _to, uint256 _amount, uint256 _etherValue) public returns (bool);
    function sell(address _to, uint256 _amount, uint256 _etherValue) public returns (bool);

}