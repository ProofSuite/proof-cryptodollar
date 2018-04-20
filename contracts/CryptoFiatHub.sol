pragma solidity ^0.4.19;

import './libraries/SafeMath.sol';
import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';
import './libraries/RewardsStorageProxy.sol';
import './interfaces/ProofTokenInterface.sol';
import './interfaces/RewardsInterface.sol';
import './interfaces/CryptoDollarInterface.sol';
import './interfaces/MedianizerInterface.sol';
import './utils/usingOraclize.sol';
import './utils/Logger.sol';


contract CryptoFiatHub is usingOraclize
{
    using SafeMath for uint256;
    using CryptoFiatStorageProxy for address;
    using RewardsStorageProxy for address;

    enum State { PEGGED, UNPEGGED }
    enum Feed { ORACLIZE, MEDIANIZER }
    enum Func { Buy, Sell, SellUnpegged }

    CryptoDollarInterface public cryptoDollar;
    ProofTokenInterface public proofToken;
    RewardsInterface public proofRewards;
    MedianizerInterface public medianizer;

    Feed public feed;
    uint256 pointMultiplier = 10 ** 18;
    address public store;
    bool public mockOraclize = true;

    mapping (bytes32 => address) public callingAddress;
    mapping (bytes32 => uint256) public callingValue;
    mapping (bytes32 => Func) public callingFunction;
    mapping (bytes32 => uint256) public callingFee;
    string public IPFSHash;

    event OraclizeCallback(bytes32 queryId);
    event MedianizerCallback();
    event BuyCryptoDollar(bytes32 queryId, address sender, uint256 value, uint256 oraclizeFee);
    event SellCryptoDollar(bytes32 queryId, address sender, uint256 tokenAmount, uint256 oraclizeFee);
    event SellUnpeggedCryptoDollar(bytes32 queryId, address sender, uint256 tokenAmount, uint256 oraclizeFee);
    event BuyCryptoDollarCallback(bytes32 queryId, uint256 exchangeRate, address sender, uint256 tokenAmount, uint256 paymentValue);
    event SellCryptoDollarCallback(bytes32 queryId, uint256 exchangeRate, address sender, uint256 tokenAmount, uint256 paymentValue);
    event SellUnpeggedCryptoDollarCallback(bytes32 queryId, uint256 exchangeRate, address sender, uint256 tokenAmount, uint256 paymentValue);

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
    * @param _IPFSHash {string} - ETH/USD conversion script IPFS address
    * @param _medianizerAddress {address} - Medianizer contract address
    */
    //TODO need to set ownership model
    function initialize(uint256 _blocksPerEpoch, string _IPFSHash, address _medianizerAddress) public
    {
        store.setCreationBlockNumber(block.number);
        store.setBlocksPerEpoch(_blocksPerEpoch);
        IPFSHash = _IPFSHash;
        medianizer = MedianizerInterface(_medianizerAddress);
    }

    /**
     * @notice Change the feed type to Oraclize. Oraclize is an provable oracle
     * infrastructure compatible with Etheruem.
     * @param _mock {bool} If set to true oraclize will not be called
     */
    function useOraclize(bool _mock) public
    {
        feed = Feed.ORACLIZE;
        mockOraclize = _mock;
    }

    /**
     * @notice Modify the ETH/USD price feed computation script IPFS address
     * @param _IPFSHash {string}
     */
    function modifyOraclizeIPFSHash(string _IPFSHash) public
    {
        IPFSHash = _IPFSHash;
    }

    /**
     * @notice This function sets the Oraclize Address Resolver.
     * It should only be used for testing with a local ethereum-bridge
     * @param _oar {address} Oraclize Address Resolver
     */
    function setOraclizeOAR(address _oar) public {
        if (_oar == 0x0)
        {
          _oar = 0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475;
        }
        OAR = OraclizeAddrResolverI(_oar);
    }

    /**
     * @notice Change the feed type to Medianizer. The medianizer is a smart-contract
     * operated by Maker that 'medianizes' the ETH/USD price feed.
     */
    function useMedianizer() public
    {
        feed = Feed.MEDIANIZER;
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


        if (feed == Feed.ORACLIZE)
        {
            require(this.balance > oraclize_getPrice("computation"));
            bytes32 queryId;
            if (!mockOraclize)
            {
                queryId = oraclize_query("computation", [IPFSHash], 300000);
            }
            else
            {
                queryId = keccak256(block.number); //for testing purposes only
            }
            callingAddress[queryId] = msg.sender;
            callingValue[queryId] = msg.value;
            callingFunction[queryId] = Func.Buy;
            callingFee[queryId] = oraclize_getPrice("computation");
            BuyCryptoDollar(queryId, msg.sender, msg.value, oraclize_getPrice("computation"));
        }
        else if (feed == Feed.MEDIANIZER)
        {
            bytes32 exchangeRateInBytes;
            (exchangeRateInBytes, ) = (medianizer.compute());
            uint256 exchangeRate = uint256(exchangeRateInBytes);
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
    function sellCryptoDollar(uint256 _tokenAmount) public payable
    {
        uint256 oraclizeFee = oraclize_getPrice("computation");
        uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);


        require(_tokenAmount >= 0);
        require(_tokenAmount <= tokenBalance);

        if (feed == Feed.ORACLIZE)
        {
            bytes32 queryId;
            if (!mockOraclize)
            {
                queryId = oraclize_query("computation", [IPFSHash], 300000);
            }
            else
            {
                queryId = keccak256(block.number); //for testing purposes only
            }
            callingAddress[queryId] = msg.sender;
            callingValue[queryId] = _tokenAmount;
            callingFunction[queryId] = Func.Sell;
            callingFee[queryId] = oraclizeFee;
            SellCryptoDollar(queryId, msg.sender, _tokenAmount, oraclizeFee);
        }
        else if (feed == Feed.MEDIANIZER)
        {
            bytes32 exchangeRateInBytes;
            (exchangeRateInBytes, ) = (medianizer.compute());
            uint256 exchangeRate = uint256(exchangeRateInBytes);
            __medianizerCallback(exchangeRate, Func.Sell, msg.sender, _tokenAmount);
            SellCryptoDollar(0x0, msg.sender, _tokenAmount, 0);
        }
    }

    /**
    * @notice sellUnpeggedCryptoDollar sells CryptoDollar tokens for the equivalent ether value at which they were bought
    * @param _tokenAmount Number of CryptoDollar tokens to be sold against ether
    */
    function sellUnpeggedCryptoDollar(uint256 _tokenAmount) public payable
    {
        uint256 oraclizeFee = oraclize_getPrice("computation");
        uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);

        require(_tokenAmount >= 0);
        require(_tokenAmount <= tokenBalance);

        if (feed == Feed.ORACLIZE)
        {
            bytes32 queryId;
            if (!mockOraclize)
            {
                queryId = oraclize_query("computation", [IPFSHash], 300000);
            }
            else
            {
                queryId = keccak256(block.number);
            }
            callingAddress[queryId] = msg.sender;
            callingValue[queryId] = _tokenAmount;
            callingFunction[queryId] = Func.SellUnpegged;
            callingFee[queryId] = oraclizeFee;
            SellUnpeggedCryptoDollar(queryId, msg.sender, _tokenAmount, oraclizeFee);
        }
        else if (feed == Feed.MEDIANIZER)
        {
            bytes32 exchangeRateInBytes;
            (exchangeRateInBytes, ) = (medianizer.compute());
            uint256 exchangeRate = uint256(exchangeRateInBytes);
            __medianizerCallback(exchangeRate, Func.SellUnpegged, msg.sender, _tokenAmount);
            SellUnpeggedCryptoDollar(0x0, msg.sender, _tokenAmount, 0);
        }
    }

    /**
    * @notice __callback is triggered asynchronously after a buy/sell through Oraclize.
    * @dev In production this function should be callable only by the oraclize callback address.
    *      The contract has to be appropriately set up to do so
    * @param _queryId {bytes32} Oraclize Query ID identidying the original transaction
    * @param _result {string} Oraclize query result (average of the ETH/USD price)
    */
    function __callback(bytes32 _queryId, string _result) public onlyOraclize
    {
        uint256 exchangeRate = parseInt(_result);
        uint256 value = callingValue[_queryId];
        address sender = callingAddress[_queryId];
        uint256 fee = callingFee[_queryId];

        if (callingFunction[_queryId] == Func.Buy)
        {
            buyCryptoDollarCallback(_queryId, exchangeRate, value, sender, fee);
        }
        else if (callingFunction[_queryId] == Func.Sell)
        {
            sellCryptoDollarCallback(_queryId, exchangeRate, value, sender, fee);
        }
        else if (callingFunction[_queryId] == Func.SellUnpegged)
        {
            sellUnpeggedCryptoDollarCallback(_queryId, exchangeRate, value, sender, fee);
        }
    }


    function __medianizerCallback(uint256 _exchangeRate, Func _func, address _sender, uint256 _value) internal
    {
      if (_func == Func.Buy)
      {
          buyCryptoDollarCallback(0x0, _exchangeRate, _value, _sender, 0);
      }
      else if (_func == Func.Sell)
      {
          sellCryptoDollarCallback(0x0, _exchangeRate, _value, _sender, 0);
      }
      else if (_func == Func.SellUnpegged)
      {
          sellUnpeggedCryptoDollarCallback(0x0, _exchangeRate, _value, _sender, 0);
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
  function buyCryptoDollarCallback(bytes32 _queryId, uint256 _exchangeRate, uint256 _value, address _sender, uint256 _oraclizeFee) internal
  {
      require(inState(State.PEGGED, _exchangeRate));
      uint256 tokenHoldersFee = _value.div(200);
      uint256 bufferFee = _value.div(200);
      uint256 paymentValue = _value - tokenHoldersFee - bufferFee - _oraclizeFee;

      proofRewards.receiveRewards.value(tokenHoldersFee)();
      uint256 tokenAmount = paymentValue.mul(_exchangeRate).div(1 ether);

      cryptoDollar.buy(_sender, tokenAmount, paymentValue);
      BuyCryptoDollarCallback(_queryId, _exchangeRate, _sender, tokenAmount, paymentValue);
  }

  /**
  * @notice buyCryptoDollarCallback is called internally through __callback
  * This function is called if the queryID corresponds to a Sell call
  * @param _exchangeRate {uint256} Exchange Rate
  * @param _tokenAmount {uint256} Amount of tokens to be sold
  * @param _sender {address} Transaction sender address
  * @param _oraclizeFee {string} Oraclize Fee (0 if called from medianizer)
  */
  function sellCryptoDollarCallback(bytes32 _queryId, uint256 _exchangeRate, uint256 _tokenAmount, address _sender, uint256 _oraclizeFee) internal
  {
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
      SellCryptoDollarCallback(_queryId, _exchangeRate, _sender, _tokenAmount, paymentValue);
  }

  /**
  * @notice sellUnpeggedCryptoDollarCallback is called internally through __callback
  * This function is called if the queryID corresponds to a SellUnpegged call
  * @param _exchangeRate {uint256} Exchange rate
  * @param _tokenAmount {uint256} Amount of tokens to be sold for ether
  * @param _sender {address} Transaction sender address
  * @param _oraclizeFee {string} Oraclize Fee (0 if called from medianizer)
  */
  function sellUnpeggedCryptoDollarCallback(bytes32 _queryId, uint256 _exchangeRate, uint256 _tokenAmount, address _sender, uint256 _oraclizeFee) internal
  {
      require(inState(State.UNPEGGED, _exchangeRate));

      uint256 tokenBalance = cryptoDollar.balanceOf(_sender);
      uint256 reservedEther = cryptoDollar.reservedEther(_sender);

      require(_tokenAmount > 0);
      require(_tokenAmount <= tokenBalance);

      uint256 tokenValue = _tokenAmount.mul(reservedEther).div(tokenBalance);
      require(tokenValue > _oraclizeFee);

      uint256 paymentValue = tokenValue - _oraclizeFee;
      cryptoDollar.sell(_sender, _tokenAmount, tokenValue);
      _sender.transfer(paymentValue);
      SellUnpeggedCryptoDollarCallback(_queryId, _exchangeRate, _sender, _tokenAmount, paymentValue);
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
  function totalOutstanding(uint256 _exchangeRate) public constant returns(uint256)
  {
      uint256 supply = cryptoDollar.totalSupply();
      return supply.mul(1 ether).div(_exchangeRate);
  }

  /**
  * @notice The buffer function computes the difference between the current contract balance and the amount of outstanding tokens.
  * @param _exchangeRate {uint256}
  * @return {int256} Buffer Value
  */
  function buffer(uint256 _exchangeRate) public constant returns (int256)
  {
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

  /**
   * @notice Allows cryptoDollar buyers to withdraw the ether value sent to the contract
   * before the callback function happens. This allows users to retrieve the funds sent
   * to the CryptoDollar contract in case oraclize fails to send a callback transaction
   * @param _queryId {bytes32} - Oraclize query ID
   */
  function withdrawEther(bytes32 _queryId) public
  {
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

  modifier onlyOraclize()
  {
      if (!mockOraclize)
      {
          require(msg.sender == oraclize_cbAddress());
      }
      _;
  }
}