pragma solidity ^0.4.19;

import '../libraries/SafeMath.sol';
import '../libraries/CryptoDollarStorageProxy.sol';
import '../libraries/CryptoFiatStorageProxy.sol';
import '../libraries/RewardsStorageProxy.sol';
import '../interfaces/ProofTokenInterface.sol';
import '../interfaces/StoreInterface.sol';
import '../interfaces/RewardsInterface.sol';
import '../interfaces/CryptoDollarInterface.sol';
import '../interfaces/PriceFeedInterface.sol';
import '../utils/usingOraclize.sol';
import '../utils/Logger.sol';



contract CryptoFiatHubMock is usingOraclize, Logger {
  using SafeMath for uint256;
  using CryptoFiatStorageProxy for address;
  using RewardsStorageProxy for address;

  CryptoDollarInterface public cryptoDollar;
  ProofTokenInterface public proofToken;
  RewardsInterface public proofRewards;
  PriceFeedInterface public priceFeed;
  uint256 pointMultiplier = 10 ** 18;
  address public store;

  uint256 public exchangeRate;
  address public querySender;
  uint256 public etherValue;
  uint256 public tokenNumber;
  bool public buyCryptoDollarCalled;
  bool public sellCryptoDollarCalled;
  bool public sellUnpeggedCryptoDollarCalled;

  enum State { PEGGED, UNPEGGED }
  enum Func { Buy, Sell, SellUnpegged }

  function CryptoFiatHubMock(address _cryptoDollarAddress, address _storeAddress, address _proofTokenAddress, address _proofRewardsAddress, address _priceFeedAddress) public {
    cryptoDollar = CryptoDollarInterface(_cryptoDollarAddress);
    proofToken = ProofTokenInterface(_proofTokenAddress);
    proofRewards = RewardsInterface(_proofRewardsAddress);
    priceFeed = PriceFeedInterface(_priceFeedAddress);
    store = _storeAddress;
    querySender = 0x0;

    OAR = OraclizeAddrResolverI(0xE40bc930e954d9CdBae7122F94eE88B1F3472C31); //only test mode
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


      // priceFeed.getRate(msg.sender, msg.value, PriceFeedInterface.Func.Buy);
      priceFeed.getRate.value(this.balance)(msg.sender, msg.value, PriceFeedInterface.Func.Buy);
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
    exchangeRate = _exchangeRate;
    querySender = _sender;
    etherValue = _value;
    buyCryptoDollarCalled = true;
  }

  function sellCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _tokenNumber) public {
    exchangeRate = _exchangeRate;
    querySender = _sender;
    etherValue = _tokenNumber;
    sellCryptoDollarCalled = true;
  }

  function sellUnpeggedCryptoDollarCallback(uint256 _exchangeRate, address _sender, uint256 _tokenNumber) public {
    exchangeRate = _exchangeRate;
    querySender = _sender;
    etherValue = _tokenNumber;
    sellUnpeggedCryptoDollarCalled = true;
  }

  function oraclizeFee() public constant returns (uint256) {
    oraclize_getPrice("computation");
  }
}