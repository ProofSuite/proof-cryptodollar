pragma solidity 0.4.19;


contract CryptoFiatHubInterface {

    function initialize(uint256 _blocksPerEpoch) public;
    function capitalize() public;
    function buyCryptoDollar() public;
    function sellCryptoDollar(uint256 _tokenNumber) public;
    function sellUnpeggedCryptoDollar(uint256 _tokenNumber) public;
    function buyCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _tokenNumber) public;
    function sellCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _tokenNumber) public;
    function sellUnpeggedCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _tokenuNumber) public;
    function cryptoDollarBalance(address _holder) public constant returns (uint256);
    function cryptoDollarTotalSupply() public constant returns (uint256);
    function totalOutstanding() public constant returns (uint256);
    function buffer() public constant returns (int256);
    function contractBalance() public constant returns (uint256);

}