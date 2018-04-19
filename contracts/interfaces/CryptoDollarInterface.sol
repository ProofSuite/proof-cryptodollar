pragma solidity 0.4.19;

contract CryptoDollarInterface
{
    function totalSupply() public constant returns (uint);
    function balanceOf(address _owner) public constant returns(uint256 balance);
    function reservedEther(address _owner) public constant returns(uint value);
    function buy(address _to, uint256 _amount, uint256 _etherValue) public returns (bool);
    function sell(address _to, uint256 _amount, uint256 _etherValue) public returns (bool);
}