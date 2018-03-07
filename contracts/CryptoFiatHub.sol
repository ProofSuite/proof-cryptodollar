pragma solidity ^0.4.19;

import './libraries/SafeMath.sol';
import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';
import './libraries/RewardsStorageProxy.sol';
import './interfaces/ProofTokenInterface.sol';
import './interfaces/StoreInterface.sol';
import './interfaces/RewardsInterface.sol';
import './interfaces/CryptoDollarInterface.sol';
import './interfaces/PriceFeedInterface.sol';
import './utils/usingOraclize.sol';
import './utils/Logger.sol';


contract CryptoFiatHub is usingOraclize, Logger {
  using SafeMath for uint256;
  using CryptoFiatStorageProxy for address;
  using RewardsStorageProxy for address;

  CryptoDollarInterface public cryptoDollar;
  ProofTokenInterface public proofToken;
  RewardsInterface public proofRewards;
  uint256 pointMultiplier = 10 ** 18;
  address public store;

  enum State { PEGGED, UNPEGGED }
  enum Func { Buy, Sell, SellUnpegged }

  function CryptoFiatHub(address _cryptoDollarAddress, address _storeAddress, address _proofTokenAddress, address _proofRewardsAddress, address _priceFeedAddress) public {
    cryptoDollar = CryptoDollarInterface(_cryptoDollarAddress);
    proofToken = ProofTokenInterface(_proofTokenAddress);
    proofRewards = RewardsInterface(_proofRewardsAddress);
    store = _storeAddress;

    OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475); //only test mode
  }

  /**
   * @notice initialize() initialize the CryptoFiat smart contract system (CryptoFiat/CryptoDollar/Rewards)
   * @param _blocksPerEpoch {uint256} - Number of blocks per reward epoch.
   */
  function initialize(uint256 _blocksPerEpoch) public {
    store.setCreationBlockNumber(block.number);
    store.setBlocksPerEpoch(_blocksPerEpoch);
  }


  /**
  * @dev Is payable needed ?
  * @notice Sending ether to the contract will result in an error
  */
  function () public payable {
    revert();
  }

  /**
  * @notice Capitalize contract
  */
  function capitalize() public payable {}

  function buyCryptoDollar() public payable {
      require(msg.sender != 0x0);
      require(msg.value > 0);
      uint256 oraclizeFee = oraclize_getPrice("computation");

      priceFeed.getRate.value(this.balance)(msg.sender, msg.value - oraclizeFee, PriceFeedInterface.Func.Buy);
  }

  /**
  * @notice sellCryptoDollar() sells CryptoDollar tokens for the equivalent USD value at which they were bought
  * @param _tokenNumber Number of CryptoDollar tokens to be sold against ether
  */
  function sellCryptoDollar(uint256 _tokenNumber) public payable {
    uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);

    require(_tokenNumber >= 0);
    require(_tokenNumber <= tokenBalance);
    uint256 oraclizeFee = oraclize_getPrice("computation");

    priceFeed.getRate.value(oraclizeFee)(msg.sender, _tokenNumber, PriceFeedInterface.Func.Sell);
  }

  /**
  * @notice sellUnpeggedCryptoDollar sells CryptoDollar tokens for the equivalent ether value at which they were bought
  * @dev Need to replace inState by inFutureState to account for the possibility the contract could become unpegged with the current transaction
  * @param _tokenNumber Number of CryptoDollar tokens to be sold against ether
  */
  function sellUnpeggedCryptoDollar(uint256 _tokenNumber) public payable {
    uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);

    require(_tokenNumber >= 0);
    require(_tokenNumber <= tokenBalance);
    uint256 oraclizeFee = oraclize_getPrice("computation");

    priceFeed.getRate.value(oraclizeFee)(msg.sender, _tokenNumber, PriceFeedInterface.Func.SellUnpegged);
  }


  function buyCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _value) public {
    require(inState(State.PEGGED, _exchangeRate));
    require(msg.sender == address(priceFeed));

    uint256 tokenHoldersFee = _value.div(200);
    uint256 bufferFee = _value.div(200);
    uint256 paymentValue = _value - tokenHoldersFee - bufferFee;

    proofRewards.receiveRewards.value(tokenHoldersFee)();
    uint256 tokenAmount = paymentValue.mul(_exchangeRate).div(100).div(1 ether);

    cryptoDollar.buy(_sender, tokenAmount, paymentValue);
  }



  function sellCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _tokenNumber) public {
    require(inState(State.PEGGED, _exchangeRate));
    require(msg.sender == address(priceFeed));

    //do the checks again to avoid race condition
    uint256 tokenBalance = cryptoDollar.balanceOf(_sender);
    uint256 reservedEther = cryptoDollar.reservedEther(_sender);
    require(_tokenNumber >= 0);
    require(_tokenNumber <= tokenBalance);

    printNumber("Callback", _exchangeRate);

    uint256 paymentValue = _tokenNumber.mul(1 ether).mul(100).div(_exchangeRate);

    printNumber("PaymentValue", paymentValue);

    uint256 etherValue = _tokenNumber.mul(reservedEther).div(tokenBalance);

    cryptoDollar.sell(_sender, _tokenNumber, etherValue);
    _sender.transfer(paymentValue);

  }

  /**
  * @dev Not quite sure if it is necessary to query the exchangeRate in this case. A priori one needs to make sure
  * that the contract is unpegged to let this function be called. So i think the exchange rate needs to be updated each time
  * there is an attempt to call this function
  */
  function sellUnpeggedCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _tokenNumber) public {
    require(inState(State.UNPEGGED, _exchangeRate));
    require(msg.sender == address(priceFeed));

    uint256 tokenBalance = cryptoDollar.balanceOf(_sender);
    uint256 reservedEther = cryptoDollar.reservedEther(_sender);

    require(_tokenNumber >= 0);
    require(_tokenNumber <= tokenBalance);

    uint256 etherValue = _tokenNumber.mul(reservedEther).div(tokenBalance);

    cryptoDollar.sell(_sender, _tokenNumber, etherValue);
    _sender.transfer(etherValue);
  }



  /**
  * @notice Proxies _holder CryptoDollar token balance from the CryptoDollar contract
  * @param _holder cryptoDollar token holder balance
  * @return the cryptoDollar token balance of _holder
  */
  function cryptoDollarBalance(address _holder) public constant returns(uint256) {
    return cryptoDollar.balanceOf(_holder);
  }

  /**
  * @notice Proxies the total supply of CryptoDollar tokens from the CryptoDollar contract
  * @return Total supply of cryptoDollar
  */
  function cryptoDollarTotalSupply() public constant returns (uint256) {
    return cryptoDollar.totalSupply();
  }

  /**
  * @notice The totalOutstanding() function returns the amount of ether that is owed to all cryptoDollar token holders for a pegged contract state
  * @return Total value in ether of the cryptoDollar tokens that have been issued
  */
  function totalOutstanding(uint256 _exchangeRate) public constant returns(uint256) {
    uint256 supply = cryptoDollar.totalSupply();
    return supply.mul(1 ether).div(_exchangeRate);
  }

  /**
  * @notice The buffer function computes the difference between the current contract balance and the amount of outstanding tokens.
  * @return Buffer Value
  */
  function buffer(uint256 _exchangeRate) public constant returns (int256) {
    int256 value = int256(this.balance - totalOutstanding(_exchangeRate));
    return value;
  }


  function inState(State state, uint256 _exchangeRate) public view returns (bool) {
    if (buffer(_exchangeRate) > 0) {
      return (state == State.PEGGED);
    } else {
      return (state == State.UNPEGGED);
    }
  }

  function contractBalance() public constant returns (uint256) {
    return this.balance;
  }

  function oraclizeFee() public constant returns (uint256) {
    oraclize_getPrice("computation");
  }
}