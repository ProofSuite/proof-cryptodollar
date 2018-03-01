pragma solidity 0.4.19;

contract PriceFeedInterface {

    enum Func { Buy, Sell, SellUnpegged }

    uint256 public exchangeRate;

    function getRate(address _sender, uint256 _value, Func _func) public payable;

    /**
     * This function is present in the interface for mocking/testing purposes
     * and is not concretely implemented in the production version of the PriceFeed
     * contract.
     */
    function setRate(uint256 _exchangeRate) public;
    function __callback() public;

}