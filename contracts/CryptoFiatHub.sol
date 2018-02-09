pragma solidity ^0.4.18;

import './libraries/SafeMath.sol';
import './libraries/CryptoDollarStorageProxy.sol';
import './libraries/CryptoFiatStorageProxy.sol';
import './interfaces/ProofTokenInterface.sol';
import './interfaces/StoreInterface.sol';
import './interfaces/ProofRewardsInterface.sol';
import './interfaces/CryptoDollarInterface.sol';



contract CryptoFiatHub {
  using SafeMath for uint256;
  using CryptoFiatStorageProxy for address;


  CryptoDollarInterface public cryptoDollar;
  ProofTokenInterface public proofToken;
  ProofRewardsInterface public proofRewards;
  uint256 pointMultiplier = 10 ** 18;
  address public store;
  uint256 public exchangeRate;

  enum State{ PEGGED, UNPEGGED }


  function CryptoFiatHub(address _cryptoDollarAddress, address _storeAddress, address _proofTokenAddress, address _proofRewardsAddress) public {
    cryptoDollar = CryptoDollarInterface(_cryptoDollarAddress);
    proofToken = ProofTokenInterface(_proofTokenAddress);
    proofRewards = ProofRewardsInterface(_proofRewardsAddress);
    store = _storeAddress;
    exchangeRate = 10000;
    uint256 initialBlockNumber = block.number;
    store.setCreationBlockNumber(initialBlockNumber);
  }


  /**
  * @dev Is payable needed ?
  * @notice Sending ether to the contract will result in an error
  */
  function () payable {
    revert();
  }

  /**
  * @notice Capitalize contract
  */
  function capitalize() public payable {}


  /**
  * @notice buyCryptoDollar() buys CryptoDollar tokens for a price of 1 CryptoDollar Token = 1 USD (paid in ether)
  */
  function buyCryptoDollar() public payable {
      require(msg.sender != 0x0);
      require(msg.value > 0);

      uint256 value = msg.value;
      uint256 tokenHoldersFee = value.div(200);
      uint256 bufferFee = value.div(200);
      uint256 paymentValue = value - tokenHoldersFee - bufferFee;

      proofRewards.receiveDividends.value(tokenHoldersFee)();
      uint256 tokenAmount = paymentValue.mul(exchangeRate).div(1 ether);

      cryptoDollar.buy(msg.sender, tokenAmount, paymentValue);
  }

  /**
  * @notice sellCryptoDollar() sells CryptoDollar tokens for the equivalent USD value at which they were bought
  * @param _tokenNumber Number of CryptoDollar tokens to be sold against ether
  */
  function sellCryptoDollar(uint256 _tokenNumber) inState(State.PEGGED) public {
      uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);
      uint256 reservedEther = cryptoDollar.guaranteedEther(msg.sender);

      require(_tokenNumber >= 0);
      require(_tokenNumber <= tokenBalance);

      uint256 paymentValue = _tokenNumber.mul(1 ether).div(exchangeRate);
      uint256 etherValue = _tokenNumber.mul(reservedEther).div(tokenBalance);

      cryptoDollar.sell(msg.sender, _tokenNumber, etherValue);
      msg.sender.transfer(paymentValue);
  }


  /**
  * @notice sellUnpeggedCryptoDollar sells CryptoDollar tokens for the equivalent ether value at which they were bought
  * @dev Need to replace inState by inFutureState to account for the possibility the contract could become unpegged with the current transaction
  * @param _tokenNumber Number of CryptoDollar tokens to be sold against ether
  */
  function sellUnpeggedCryptoDollar(uint256 _tokenNumber) inState(State.UNPEGGED) public {
    uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);
    uint256 reservedEther = cryptoDollar.guaranteedEther(msg.sender);

    require(_tokenNumber >= 0);
    require(_tokenNumber <= tokenBalance);

    // uint256 etherValue  = reservedEther;
    uint256 etherValue = _tokenNumber.mul(reservedEther).div(tokenBalance);

    cryptoDollar.sell(msg.sender, _tokenNumber, etherValue);
    msg.sender.transfer(etherValue);
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
  function totalOutstanding() public constant returns(uint256) {
    uint256 supply = cryptoDollar.totalSupply();
    return supply.mul(1 ether).div(exchangeRate);
  }

  /**
  * @notice The buffer function computes the difference between the current contract balance and the amount of outstanding tokens.
  * @return Buffer Value
  */
  function buffer() public constant returns (int256) {
    int256 value = int256(this.balance - totalOutstanding());
    return value;
  }


  function contractBalance() public constant returns (uint256) {
    return this.balance;
  }

  /**
  * @return Current state of the contract
  */
  function currentState() public constant returns (State) {
    if (buffer() > 0) {
      return State.PEGGED;
    } else {
      return State.UNPEGGED;
    }
  }


  /**
  * @notice Computes the state of the contract whenever included in function header
  * @param state Potential contract state (either PEGGED or UNPEGGED)
  */
  modifier inState(State state) {
    assert(state == currentState());
    _;
  }

  /**
  * @dev Temporary mock function. Will be removed when adding interactions with oracles
  * @param _value of the new ETH/USD conversion rate in cents
  */
  function setExchangeRate(uint256 _value) public {
    exchangeRate = _value;
  }


}