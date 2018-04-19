pragma solidity ^0.4.19;

import './libraries/SafeMath.sol';
import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';
import './libraries/RewardsStorageProxy.sol';
import './interfaces/ProofTokenInterface.sol';
import './interfaces/RewardsInterface.sol';
import './interfaces/CryptoDollarInterface.sol';
import './utils/usingOraclize.sol';


contract CryptoFiatHub is usingOraclize {
  using SafeMath for uint256;
  using CryptoFiatStorageProxy for address;
  using RewardsStorageProxy for address;

  CryptoDollarInterface public cryptoDollar;
  ProofTokenInterface public proofToken;
  RewardsInterface public proofRewards;
  uint256 pointMultiplier = 10 ** 18;
  address public store;
  bool public usingOraclize;

  mapping (bytes32 => address) public callingAddress;
  mapping (bytes32 => uint256) public callingValue;
  mapping (bytes32 => Func) public callingFunction;
  mapping (bytes32 => uint256) public callingFee;
  string public ipfsHash;

  enum State { PEGGED, UNPEGGED }
  enum Func { Buy, Sell, SellUnpegged }

  event OraclizeCallback(bytes32 queryId);
  event MedianizerCallback();
  event BuyCryptoDollar(bytes32 queryId, address sender, uint256 value, uint256 oraclizeFee);
  event SellCryptoDollar(bytes32 queryId, address sender, uint256 tokenAmount, uint256 oraclizeFee);
  event SellUnpeggedCryptoDollar(bytes32 queryId, address sender, uint256 tokenAmount, uint256 oraclizeFee);
  event BuyCryptoDollarCallback(bytes32 queryId, string result, address sender, uint256 tokenAmount, uint256 paymentValue);
  event SellCryptoDollarCallback(bytes32 queryId, string result, address sender, uint256 tokenAmount, uint256 paymentValue);
  event SellUnpeggedCryptoDollarCallback(bytes32 queryId, string result, address sender, uint256 tokenAmount, uint256 paymentValue);

  function CryptoFiatHub(address _cryptoDollarAddress, address _storeAddress, address _proofTokenAddress, address _proofRewardsAddress) public {
    cryptoDollar = CryptoDollarInterface(_cryptoDollarAddress);
    proofToken = ProofTokenInterface(_proofTokenAddress);
    proofRewards = RewardsInterface(_proofRewardsAddress);
    store = _storeAddress;
  }

  /**
   * @notice initialize() initialize the CryptoFiat smart contract system (CryptoFiat/CryptoDollar/Rewards)
   * @param _blocksPerEpoch {uint256} - Number of blocks per reward epoch.
   */
   //TODO need to set ownership model
  function initialize(uint256 _blocksPerEpoch) public {
    store.setCreationBlockNumber(block.number);
    store.setBlocksPerEpoch(_blocksPerEpoch);
  }

  //TODO need to set ownership model
  function initializeOraclize(string _ipfsHash, bool _test) public {
    usingOraclize = true;
    ipfsHash = _ipfsHash;
    if (_test) {
      OAR = OraclizeAddrResolverI(0x6f485c8bf6fc43ea212e93bbf8ce046c7f1cb475); //only test mode
    }
  }

  function initializeMedianizer(address _medianizer) public {
    usingMedianizer = true;
    medianizer = MedianizerBridge(_medianizer)
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
      require(this.balance > oraclize_getPrice("computation"));
      require(msg.sender != 0x0);
      require(msg.value > 0);
      bytes32 queryId;

      if (usingOraclize) {
        queryId = oraclize_query("computation", [ipfsHash], 300000);
      } else {
        queryId = keccak256(block.number); //for testing purposes only
      }

      if (feed == feed.ORACLIZE) {
        callingAddress[queryId] = msg.sender;
        callingValue[queryId] = msg.value;
        callingFunction[queryId] = Func.Buy;
        callingFee[queryId] = oraclize_getPrice("computation");
        BuyCryptoDollar(queryId, msg.sender, msg.value, oraclize_getPrice("computation"));
      }

      if (feed == feed.MEDIANIZER) {
        uint256 exchangeRate = uint(medianizer.compute());
        __medianizerCallback(exchangeRate, Func.Buy, msg.sender, msg.value);
        BuyCryptoDollar(0x0, msg.sender, msg.value, 0);
      }
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
  function sellCryptoDollar(uint256 _tokenAmount) public payable {
    uint256 oraclizeFee = oraclize_getPrice("computation");
    uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);
    bytes32 queryId;

    require(_tokenAmount >= 0);
    require(_tokenAmount <= tokenBalance);

    if (usingOraclize) {
      queryId = oraclize_query("computation", [ipfsHash], 300000);
    } else {
      queryId = keccak256(block.number); //for testing purposes only
    }

    if (feed == feed.ORACLIZE) {
      callingAddress[queryId] = msg.sender;
      callingValue[queryId] = _tokenAmount;
      callingFunction[queryId] = Func.Sell;
      callingFee[queryId] = oraclizeFee;
      SellCryptoDollar(queryId, msg.sender, _tokenAmount, oraclizeFee);
    }

    if (feed == feed.MEDIANIZER) {
      uint256 exchangeRate = uint(medianizer.compute());
      __medianizerCallback(exchangeRate, Func.Sell, msg.sender, msg.value);
      BuyCryptoDollar(0x0, msg.sender, msg.value, 0);
    }
  }

  /**
  * @notice sellUnpeggedCryptoDollar sells CryptoDollar tokens for the equivalent ether value at which they were bought
  * @param _tokenAmount Number of CryptoDollar tokens to be sold against ether
  */
  function sellUnpeggedCryptoDollar(uint256 _tokenAmount) public payable {
    uint256 oraclizeFee = oraclize_getPrice("computation");
    uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);
    bytes32 queryId;

    require(_tokenAmount >= 0);
    require(_tokenAmount <= tokenBalance);

    if (usingOraclize) {
      queryId = oraclize_query("computation", [ipfsHash], 300000);
    } else {
      queryId = keccak256(block.number);
    }

    if (feed == feed.ORACLIZE) {
      callingAddress[queryId] = msg.sender;
      callingValue[queryId] = _tokenAmount;
      callingFunction[queryId] = Func.SellUnpegged;
      callingFee[queryId] = oraclizeFee;
      SellUnpeggedCryptoDollar(queryId, msg.sender, _tokenAmount, oraclizeFee);
    }

    if (feed == feed.MEDIANIZER) {
      uint256 exchangeRate = uint(medianizer.compute());
      __medianizerCallback(exchangeRate, Func.SellUnpegged, msg.sender, msg.value);
      BuyCryptoDollar(0x0, msg.sender, msg.value, 0);
    }
  }

  /**
   * @notice __callback is triggered asynchronously after a buy/sell through Oraclize.
   * @dev In production this function should be callable only by the oraclize callback address.
   *      The contract has to be appropriately set up to do so
   * @param _queryId {bytes32} Oraclize Query ID identidying the original transaction
   * @param _result {string} Oraclize query result (average of the ETH/USD price)
   */
  function __callback(bytes32 _queryId, string _result) public onlyOraclize {
    uint256 exchangeRate = parseInt(_result);
    uint256 value = callingValue[_queryId];
    address sender = callingAddress[_queryId];
    uint256 fee = callingFee[_queryId];

    OraclizeCallback(bytes32 _queryId);

    if (callingFunction[_queryId] == Func.Buy) {
      buyCryptoDollarCallback(exchangeRate, value, sender, fee);
    } else if (callingFunction[_queryId] == Func.Sell) {
      sellCryptoDollarCallback(exchangeRate, value, sender, fee);
    } else if (callingFunction[_queryId] == Func.SellUnpegged) {
      sellUnpeggedCryptoDollarCallback(exchangeRate, value, sender, fee);
    }
  }

  function __medianizerCallback(uint256 _exchangeRate, Func _func, address _sender, uint256 _value) internal {
    MedianizerCallback();

    if (_func == Func.Buy) {
      buyCryptoDollarCallback(_exchangeRate, _value, _sender, 0);
    } else if (_func == Func.Sell) {
      sellCryptoDollarCallback(_exchangeRate, _value, _sender, 0);
    } else if (_func == Func.SellUnpegged) {
      sellUnpeggedCryptoDollarCallback(_exchangeRate, _value, _sender, 0);
    }
  }

  /**
  * @notice buyCryptoDollarCallback is called internally through __callback
  * This function is called if the queryID corresponds to a Buy call
  * @param _exchangeRate {uint256} Oraclize queryID identifying the original transaction
  * @param _value {uint256} Amount of ether exchanged for cryptodollar tokens
  * @param _sender {address} Transaction sender address
  * @param _oraclizeFee {uint256} Oraclize Fee
  */
  function buyCryptoDollarCallback(uint256 _exchangeRate, uint256 _value, address _sender, uint256 _oraclizeFee) internal {
    require(inState(State.PEGGED, _exchangeRate));
    uint256 tokenHoldersFee = _value.div(200);
    uint256 bufferFee = _value.div(200);
    uint256 paymentValue = _value - tokenHoldersFee - bufferFee - _oraclizeFee;

    proofRewards.receiveRewards.value(tokenHoldersFee)();
    uint256 tokenAmount = paymentValue.mul(_exchangeRate).div(1 ether);

    cryptoDollar.buy(_sender, tokenAmount, paymentValue);
    BuyCryptoDollarCallback(_exchangeRate, _sender, tokenAmount, paymentValue);
  }

  /**
  * @notice buyCryptoDollarCallback is called internally through __callback
  * This function is called if the queryID corresponds to a Sell call
  * @param _exchangeRate {uint256} Exchange Rate
  * @param _tokenAmount {uint256} Amount of tokens to be sold
  * @param _sender {address} Transaction sender address
  * @param _oraclizeFee {string} Oraclize Fee (0 if called from medianizer)
  */
  function sellCryptoDollarCallback(uint256 _exchangeRate, uint256 _tokenAmount, address _sender, uint256 _oraclizeFee) internal {
    require(inState(State.PEGGED, _exchangeRate));

    uint256 tokenBalance = cryptoDollar.balanceOf(_sender);
    uint256 reservedEther = cryptoDollar.reservedEther(_sender);

    require(_tokenAmount > 0);
    require(_tokenAmount <= tokenBalance);

    uint256 tokenValue = _tokenAmount.mul(1 ether).div(_exchangeRate);
    require(tokenValue > _oraclizeFee);

    uint256 paymentValue = tokenValue - _oraclizeFee;
    uint256 etherValue = _tokenAmount.mul(reservedEther).div(tokenBalance);

    cryptoDollar.sell(_sender, _tokenAmount, etherValue);
    _sender.transfer(paymentValue);
    SellCryptoDollarCallback(_exchangeRate, _sender, _tokenAmount, paymentValue);
  }

  /**
  * @notice sellUnpeggedCryptoDollarCallback is called internally through __callback
  * This function is called if the queryID corresponds to a SellUnpegged call
  * @param _exchangeRate {uint256} Exchange rate
  * @param _tokenAmount {uint256} Amount of tokens to be sold for ether
  * @param _sender {address} Transaction sender address
  * @param _oraclizeFee {string} Oraclize Fee (0 if called from medianizer)
  */
  function sellUnpeggedCryptoDollarCallback(uint256 _exchangeRate, uint256 _tokenAmount, address _sender, uint256 _oraclizeFee) internal {
    require(inState(State.UNPEGGED, _exchangeRate));

    uint256 tokenBalance = cryptoDollar.balanceOf(_sender);
    uint256 reservedEther = cryptoDollar.reservedEther(_sender);

    require(_tokenAmount > 0);
    require(_tokenAmount <= tokenBalance);

    uint256 tokenValue = _tokenAmount.mul(reservedEther).div(tokenBalance);
    require(tokenValue > _oraclizeFee);

    uint256 paymentValue = tokenValue - _oraclizeFee);
    cryptoDollar.sell(_sender, _tokenAmount, tokenValue);
    _sender.transfer(paymentValue);
    SellUnpeggedCryptoDollarCallback(_exchangeRate, _sender, _tokenAmount, paymentValue);
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
  * @param _exchangeRate {uint256}
  * @return {int256} Buffer Value
  */
  function buffer(uint256 _exchangeRate) public constant returns (int256) {
    int256 value = int256(this.balance - totalOutstanding(_exchangeRate));
    return value;
  }

  /**
  * @notice Returns a boolean corresponding to whether the contract is in state _state
  * (for 1 ETH = _exchangeRate USD)
  * @param _state {State}
  * @param _exchangeRate {uint256}
  * @return {bool}
  */
  function inState(State _state, uint256 _exchangeRate) public view returns (bool) {
    if (buffer(_exchangeRate) > 0) {
      return (_state == State.PEGGED);
    } else {
      return (_state == State.UNPEGGED);
    }
  }

  /**
   * @notice Returns contract balance
   * @return {uint256} Contract Balance
   */
  function contractBalance() public constant returns (uint256) {
    return this.balance;
  }

  /**
   * @notice Allows cryptoDollar buyers to withdraw the ether value sent to the contract
   * before the callback function happens. This allows users to retrieve the funds sent
   * to the CryptoDollar contract in case oraclize fails to send a callback transaction
   * @param _queryId {bytes32} - Oraclize query ID
   */
  function withdrawEther(bytes32 _queryId) public {
    require(callingAddress[_queryId] == msg.sender);
    require(callingFunction[_queryId] == Func.Buy);

    uint256 oraclizeFee = callingFee[_queryId];
    uint256 value = callingValue[_queryId];
    uint256 tokenHoldersFee = value.div(200);
    uint256 paymentValue = value - tokenHoldersFee - oraclizeFee;
    require(paymentValue > 0);

    delete callingValue[_queryId];
    msg.sender.transfer(paymentValue);
  }

  modifier onlyOraclize() {
    if (usingOraclize) {
      require(msg.sender == oraclize_cbAddress());
    }
    _;
  }
}