pragma solidity ^0.4.19;

import './libraries/SafeMath.sol';
import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';
import './libraries/RewardsStorageProxy.sol';
import './interfaces/ProofTokenInterface.sol';
import './interfaces/RewardsInterface.sol';
import './interfaces/CryptoDollarInterface.sol';
import './interfaces/MedianizerInterface.sol';

contract CryptoFiatHub
{
    using SafeMath for uint256;
    using CryptoFiatStorageProxy for address;
    using RewardsStorageProxy for address;

    enum State { PEGGED, UNPEGGED }

    CryptoDollarInterface public cryptoDollar;
    ProofTokenInterface public proofToken;
    RewardsInterface public proofRewards;
    MedianizerInterface public medianizer;

    uint256 pointMultiplier = 10 ** 18;
    address public store;

    event BuyCryptoDollar(address sender, uint256 value, uint256 tokenAmount, uint256 exchangeRate);
    event SellCryptoDollar(address sender, uint256 value, uint256 tokenAmount, uint256 exchangeRate);
    event SellUnpeggedCryptoDollar(address sender, uint256 value, uint256 tokenAmount, uint256 exchangeRate);

    function CryptoFiatHub(
      address _cryptoDollarAddress,
      address _storeAddress,
      address _proofTokenAddress,
      address _proofRewardsAddress)
    public
    {
        cryptoDollar = CryptoDollarInterface(_cryptoDollarAddress);
        proofToken = ProofTokenInterface(_proofTokenAddress);
        proofRewards = RewardsInterface(_proofRewardsAddress);
        store = _storeAddress;
    }

    /**
    * @notice initialize() initialize the CryptoFiat smart contract system (CryptoFiat/CryptoDollar/Rewards)
    * @param _blocksPerEpoch {uint256} - Number of blocks per reward epoch.
    * @param _medianizerAddress {address} - Medianizer contract address
    */
    //TODO need to set ownership model
    function initialize(uint256 _blocksPerEpoch, address _medianizerAddress) public
    {
        store.setCreationBlockNumber(block.number);
        store.setBlocksPerEpoch(_blocksPerEpoch);
        medianizer = MedianizerInterface(_medianizerAddress);
    }

    /**
     * @notice Modify the Medianizer smart-contract address.
     * @param _medianizerAddress {address} Medianizer smart-contract address
     */
    function modifyMedianizerAddress(address _medianizerAddress) public
    {
        medianizer = MedianizerInterface(_medianizerAddress);
    }

    /**
    * @dev Is payable needed ?
    * @notice Sending ether to the contract will result in an error
    */
    function () public payable
    {
        revert();
    }

    /**
    * @notice Capitalize contract
    */
    function capitalize() public payable {}

    function buyCryptoDollar() public payable
    {
        require(msg.sender != 0x0);
        require(msg.value > 0);

        uint256 rate = exchangeRate();
        require(inState(State.PEGGED, rate));

        uint256 tokenHoldersFee = msg.value.div(200);
        uint256 bufferFee = msg.value.div(200);
        uint256 paymentValue = msg.value - tokenHoldersFee - bufferFee;

        proofRewards.receiveRewards.value(tokenHoldersFee)();
        uint256 tokenAmount = paymentValue.mul(rate).div(1 ether);

        cryptoDollar.buy(msg.sender, tokenAmount, paymentValue);
        BuyCryptoDollar(msg.sender, msg.value, tokenAmount, rate);
      }

    /**
    * @dev Currently the oraclizeFee is withdrawn after receiving the tokens. However, what happens when a user
    * sells a very small amount of tokens ? Then the contract balance decreases (the total value sent to the user is also 0)
    * which is problematic. The workarounds are:
    * - Add a transaction fee that corresponds to the transaction fee
    * - Put a minimum amount of tokens that you could buy/sell
    * @notice sellCryptoDollar() sells CryptoDollar tokens for the equivalent USD value at which they were bought
    * @param _tokenAmount Number of CryptoDollar tokens to be sold against ether
    */
    function sellCryptoDollar(uint256 _tokenAmount) public payable
    {
        uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);
        uint256 reservedEther = cryptoDollar.reservedEther(msg.sender);
        require(_tokenAmount >= 0);
        require(_tokenAmount <= tokenBalance);
        uint256 rate = exchangeRate();
        require(inState(State.PEGGED, rate));

        uint256 tokenValue = _tokenAmount.mul(1 ether).div(rate);
        uint256 etherValue = _tokenAmount.mul(reservedEther).div(tokenBalance);

        cryptoDollar.sell(msg.sender, _tokenAmount, etherValue);
        msg.sender.transfer(tokenValue);
        SellCryptoDollar(msg.sender, etherValue, _tokenAmount, rate);
    }

    /**
    * @notice sellUnpeggedCryptoDollar sells CryptoDollar tokens for the equivalent ether value at which they were bought
    * @param _tokenAmount Number of CryptoDollar tokens to be sold against ether
    */
    function sellUnpeggedCryptoDollar(uint256 _tokenAmount) public payable
    {
        uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);
        uint256 reservedEther = cryptoDollar.reservedEther(msg.sender);
        require(_tokenAmount >= 0);
        require(_tokenAmount <= tokenBalance);
        uint256 rate = exchangeRate();
        require(inState(State.UNPEGGED, rate));

        uint256 paymentValue = _tokenAmount.mul(reservedEther).div(tokenBalance);

        cryptoDollar.sell(msg.sender, _tokenAmount, paymentValue);
        msg.sender.transfer(paymentValue);
        SellUnpeggedCryptoDollar(msg.sender, paymentValue, _tokenAmount, rate);
    }

  /**
  * @notice Proxies _holder CryptoDollar token balance from the CryptoDollar contract
  * @param _holder cryptoDollar token holder balance
  * @return the cryptoDollar token balance of _holder
  */
  function cryptoDollarBalance(address _holder) public constant returns(uint256)
  {
      return cryptoDollar.balanceOf(_holder);
  }

  /**
  * @notice Proxies the total supply of CryptoDollar tokens from the CryptoDollar contract
  * @return Total supply of cryptoDollar
  */
  function cryptoDollarTotalSupply() public constant returns (uint256)
  {
      return cryptoDollar.totalSupply();
  }

  /**
  * @notice The totalOutstanding() function returns the amount of ether that is owed to all cryptoDollar token holders for a pegged contract state
  * @return Total value in ether of the cryptoDollar tokens that have been issued
  */
  function totalOutstanding() public constant returns(uint256)
  {
      uint256 rate = exchangeRate();
      uint256 supply = cryptoDollar.totalSupply();
      return supply.mul(1 ether).div(rate);
  }


  function totalOutstanding(uint256 _exchangeRate) public constant returns(uint256)
  {
      uint256 supply = cryptoDollar.totalSupply();
      return supply.mul(1 ether).div(_exchangeRate);
  }

  /**
  * @notice The buffer function computes the difference between the current contract balance and the amount of outstanding tokens.
  * @return {int256} Buffer Value
  */
  function buffer() public constant returns (int256 value)
  {
      uint256 rate = exchangeRate();
      value = int256(this.balance - totalOutstanding(rate));
  }

  function buffer(uint256 _exchangeRate) public constant returns (int256 value)
  {
      value = int256(this.balance - totalOutstanding(_exchangeRate));
  }

  function exchangeRate() public constant returns (uint256)
  {
      bytes32 exchangeRateInBytes;
      bool valid;
      (exchangeRateInBytes, valid) = (medianizer.peek());
      require(valid);
      return uint256(exchangeRateInBytes);
  }

  /**
  * @notice Returns a boolean corresponding to whether the contract is in state _state
  * (for 1 ETH = _exchangeRate USD)
  * @param _state {State}
  * @param _exchangeRate {uint256}
  * @return {bool}
  */
  function inState(State _state, uint256 _exchangeRate) public view returns (bool)
  {
      if (buffer(_exchangeRate) > 0)
      {
          return (_state == State.PEGGED);
      }
      else
      {
          return (_state == State.UNPEGGED);
      }
  }

  /**
   * @notice Returns contract balance
   * @return {uint256} Contract Balance
   */
  function contractBalance() public constant returns (uint256)
  {
      return this.balance;
  }
}