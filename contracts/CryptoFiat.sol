pragma solidity ^0.4.11;

import './SafeMath.sol';
import './Pausable.sol';
import './CUSDToken.sol';
import './CEURToken.sol';
import './ProofToken.sol';


/**
 * @title CryptoFiat
 * @author David Van Isacker
 * @notice CryptoFiat is a contract that exchanges pegged dollar tokens in exchange of ether. The CryptoFiat is contract is planned to be initialized capitalized with $15M.
 * This initial capitalization maintains the pegging of the CUSD or CEUR tokens. Anyone can buy crypto-fiat tokens
 * via the buyCEUR and buyCUSD function calls. If the contract is in a pegged state, tokens can be sold for the equivalent value of USD or EUR they were bought for.
 * In the event the contract becomes unpegged, tokens can be sold for the equivalent value of ether they were bought for.
 */
contract CryptoFiat is Pausable {
  using SafeMath for uint256;

  CUSDToken public CUSD;
  CEURToken public CEUR;
  ProofToken public proofToken;

  struct ConversionRate {
    uint256 ETH_USD;
    uint256 ETH_EUR;
  }

  struct Account {
    uint lastDividendPoints;
  }

  ConversionRate public conversionRate;
  uint256 public dividends;
  uint256 public totalDividendPoints;
  uint256 pointMultiplier = 10 ** 18;



  mapping(address => Account) accounts;


  enum State{ PEGGED, UNPEGGED }

  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
  event BuyCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event BuyCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellUnpeggedCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellUnpeggedCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event BufferValue(uint256 value);
  event Dividends(address purchase, uint256 value);
  event LogInt(string data, uint256 value);
  event LogString(string data, string value);
  event LogAddress(string data, address value);
  event Log(address user, uint256 data);

  /**
  * @param CUSDAddress Address of the Crypto-Dollar token
  * @param CEURAddress Address of the Crypto-Euro token
  * @param PRFTAddress Address of the Proof token
  */
  function CryptoFiat(address CUSDAddress, address CEURAddress, address PRFTAddress) {

    CEUR = CEURToken(CEURAddress);
    CUSD = CUSDToken(CUSDAddress);
    proofToken = ProofToken(PRFTAddress);
    conversionRate.ETH_USD = 25000;
    conversionRate.ETH_EUR = 20000;
    dividends = 0;

  }

  /**
  * @dev Check if payable is needed
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
  * @dev Tests seem to be working. Need to make successful tests is not due to rounding the result
  * @notice Sends dividends to the function caller. Accounts for previously retrieved dividends
  */
  function withdrawDividends() public {


    uint256 tokenBalance = proofToken.balanceOf(msg.sender);
    uint256 newDividendPoints = totalDividendPoints.sub(accounts[msg.sender].lastDividendPoints);
    uint256 owing = (tokenBalance.mul(newDividendPoints)) / pointMultiplier;

    if (owing > 0) {
      accounts[msg.sender].lastDividendPoints = totalDividendPoints;
      dividends = dividends.sub(owing);
      msg.sender.transfer(owing);
    }

    Dividends(msg.sender, owing);
  }

  /**
  * @notice Increase the total balance of dividend points and computes the dividend points owed per token
  * @dev To reduce float errors during divisions, the total dividends are multiplied by a very large point multiplier value
  * @param amount Amount of dividends to be added
  */
  function updateDividends(uint amount) {
    uint256 tokenSupply = proofToken.totalSupply();
    dividends = dividends.add(amount);
    uint256 dividendPoints = (amount.mul(pointMultiplier)) / tokenSupply;
    totalDividendPoints = totalDividendPoints.add(dividendPoints);
  }


  /**
  * @notice buyCEURTokens buys pegged crypto-EUR tokens.
  */
  function buyCEURTokens() public payable {
      require(msg.sender != 0x0);
      require(msg.value > 0);

      uint256 value = msg.value;
      uint256 tokenHoldersFee = value.div(200);
      uint256 bufferFee = value.div(200);
      uint256 paymentValue = value - tokenHoldersFee - bufferFee;

      updateDividends(tokenHoldersFee);

      uint256 tokenAmount = paymentValue.mul(conversionRate.ETH_EUR).div(1 ether);

      CEUR.buy(msg.sender, tokenAmount, paymentValue);
      BuyCEUR(msg.sender, value, tokenAmount);
  }

  /**
  * @notice buyCUSDtokens buys pegged crypto-USD tokens.
  */
  function buyCUSDTokens() public payable {
      require(msg.sender != 0x0);
      require(msg.value > 0);

      uint256 value = msg.value;
      uint256 tokenHoldersFee = value.div(200);
      uint256 bufferFee = value.div(200);
      uint256 paymentValue = value - tokenHoldersFee - bufferFee;

      updateDividends(tokenHoldersFee);
      uint256 tokenAmount = paymentValue.mul(conversionRate.ETH_USD).div(1 ether);

      CUSD.buy(msg.sender, tokenAmount, paymentValue);
      BuyCUSD(msg.sender, value, tokenAmount);
  }


  /**
  * @notice sellCEURTokens sells crypto-EUR tokens for the equivalent EUR value at which they were bought
  * @param _tokenNumber Number of crypto-EUR tokens to be sold against ether
  */
  function sellCEURTokens(uint256 _tokenNumber) public {
      require(_tokenNumber >= 0);
      require(_tokenNumber <= CEUR.balanceOf(msg.sender));
      require(currentState(_tokenNumber, "EUR") == State.PEGGED);

      uint256 paymentValue = _tokenNumber.mul(1 ether).div(conversionRate.ETH_EUR);
      msg.sender.transfer(paymentValue);

      CEUR.sell(msg.sender, _tokenNumber, paymentValue);
      SellCEUR(msg.sender, paymentValue, _tokenNumber);
  }


  /**
  * @notice sellCUSDTokens sells crypto-USD tokens for the equivalent USD value at which they were bought
  * @param _tokenNumber Number of crypto-USD tokens to be sold against ether
  */
  function sellCUSDTokens(uint256 _tokenNumber) public {
      require(_tokenNumber >= 0);
      require(_tokenNumber <= CUSD.balanceOf(msg.sender));
      require(currentState(_tokenNumber, "USD") == State.PEGGED);

      uint256 paymentValue = _tokenNumber.mul(1 ether).div(conversionRate.ETH_USD);
      msg.sender.transfer(paymentValue);

      CUSD.sell(msg.sender, _tokenNumber, paymentValue);
      SellCUSD(msg.sender, paymentValue, _tokenNumber);

  }


  /**
  * @notice sellUnpeggedCEUR sells crypto-EUR tokens for the equivalent ether value at which they were bought
  * @dev Need to replace inState by inFutureState to account for the possibility the contract could become unpegged with the current transaction
  * @param _tokenNumber Number of crypto-EUR tokens to be sold against ether
  */
  function sellUnpeggedCEUR(uint256 _tokenNumber) inState(State.UNPEGGED) public {
    uint256 tokenBalance = CEUR.balanceOf(msg.sender);
    uint256 guaranteedEther = CEUR.reservedEther(msg.sender);

    require(_tokenNumber >= 0);
    require(_tokenNumber <= tokenBalance);

    uint256 paymentValue = guaranteedEther.div(tokenBalance).mul(_tokenNumber);
    msg.sender.transfer(paymentValue);

    CEUR.sell(msg.sender, _tokenNumber, paymentValue);
    SellCEUR(msg.sender, paymentValue, _tokenNumber);

  }


  /**
  * @notice sellUnpeggedCUSD sells crypto-USD tokens for the equivalent ether value at which they were bought
  * @dev Need to replace inState by inFutureState to account for the possibility the contract could become unpegged with the current transaction
  * @param _tokenNumber Number of crypto-USD tokens to be sold against ether
  */
  function sellUnpeggedCUSD(uint256 _tokenNumber) inState(State.UNPEGGED) public {
    uint256 tokenBalance = CUSD.balanceOf(msg.sender);
    uint256 guaranteedEther = CUSD.reservedEther(msg.sender);

    require(_tokenNumber >= 0);
    require(_tokenNumber <= tokenBalance);

    uint256 paymentValue = guaranteedEther.div(tokenBalance).mul(_tokenNumber);
    msg.sender.transfer(paymentValue);

    CUSD.sell(msg.sender, _tokenNumber, paymentValue);
    SellCUSD(msg.sender, paymentValue, _tokenNumber);

  }


  /**
  * @notice getCEURTokenValue returns the value of tokens depending on current contract state
  * @param _tokenNumber : Number of tokens to be valued
  * @return Value of the crypto-EUR tokens in ether in the current contract state
  */
  function getCEURTokenValue(uint256 _tokenNumber) public constant returns (uint256 value) {

    uint256 tokenBalance = CEUR.balanceOf(msg.sender);
    uint256 guaranteedEther = CEUR.reservedEther(msg.sender);
    uint256 paymentValue;

    if (currentState() == State.PEGGED) {
      paymentValue = _tokenNumber.mul(1 ether).div(conversionRate.ETH_EUR);
    } else {
      paymentValue = guaranteedEther.mul(_tokenNumber).div(tokenBalance);
    }
    return paymentValue;
  }


  /**
  * @notice getCUSDTokenValue returns the value of tokens depending on current contract state
  * @param _tokenNumber : Number of tokens to be valued
  * @return Value of the crypto-USD tokens in ether in the current contract state
  */
  function getCUSDTokenValue(uint256 _tokenNumber) public constant returns (uint256) {
    uint256 tokenBalance = CUSD.balanceOf(msg.sender);
    uint256 guaranteedEther = CUSD.reservedEther(msg.sender);
    uint256 paymentValue;


    if (currentState() == State.PEGGED) {
      paymentValue = _tokenNumber.mul(1 ether).div(conversionRate.ETH_USD);
    } else {
      paymentValue = guaranteedEther.mul(_tokenNumber).div(tokenBalance);
    }
    return paymentValue;
  }

  /**
  * @notice reservedEther returns the CEUR tokens
  * @return value of the tokens
  */
  function reservedEther() public constant returns (uint256) {
    return CUSD.reservedEther(msg.sender) + CEUR.reservedEther(msg.sender);
  }


  /**
  * @notice This function is probably not needed
  * @param _holder crypto-USD token holder balance
  * @return the crypto-USD token balance of _holder
  */
  function CUSDBalance(address _holder) public constant returns (uint256) {
    return CUSD.balanceOf(_holder);
  }

  /**
  * @notice This function is probably not needed
  * @param _holder crypto-EUR token holder balance
  * @return the crypto-EUR token balance of _holder
  */
  function CEURBalance(address _holder) public constant returns (uint256) {
    return CEUR.balanceOf(_holder);
  }

  /**
  * @notice This function is not needed
  * @return Total supply of crypto-USD
  */
  function CUSDTotalSupply() public constant returns (uint256) {
    return CUSD.totalSupply();
  }

  /**
  * @notice This function is not needed
  * @return Total supply of crypto-EUR
  */
  function CEURTotalSupply() public constant returns (uint256) {
    return CEUR.totalSupply();
  }

  /**
  * @dev This function is not needed. Check if this function is used in the tests and remove.
  * @return Total supply of crypto-EUR
  */
  function totalBalance() public constant returns (uint256) {
    return this.balance;
  }

  /**
  * @return Total value in ether of the crypto-USD and crypto-EUR tokens that have been issued
  */
  function totalCryptoFiatValue() public constant returns(uint256) {
    uint256 CUSDSupply = CUSD.totalSupply();
    uint256 CEURSupply = CEUR.totalSupply();
    uint256 total = CUSDSupply.mul(1 ether).div(conversionRate.ETH_USD) + CEURSupply.mul(1 ether).div(conversionRate.ETH_EUR);
    return total;
  }

  /**
  * @return Cryptofiat buffer value
  */
  function buffer() public constant returns (int) {
    int value = int(this.balance - dividends - totalCryptoFiatValue());
    return value;
  }


  /**
   * @param currency {String} - "USD" or "EUR"
   * @return Conversion rate corresponding to input currency
   */
  function conversionRate(string currency) public constant returns (uint256) {
    if (sha3(currency) == sha3("USD")) {
      return conversionRate.ETH_USD;
    }
    else if (sha3(currency) == sha3("EUR")) {
      return conversionRate.ETH_EUR;
    }
  }

  modifier inState(State state) {
    assert(state == currentState());
    _;
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
  * @dev Need to refactor this function to not use currency
  * @notice Overloaded currentState function. Checks the state of the contract after current token purchase
  * @param tokenNumber the number of tokens being sold
  * @param currency which currency token is being sold
  * @return Current state of the contract
  */
  function currentState(uint256 tokenNumber, string currency) public constant returns (State) {
    uint256 rate = conversionRate(currency);
    if (buffer() > int(tokenNumber.mul(rate))) {
      return State.PEGGED;
    } else {
      return State.UNPEGGED;
    }
  }

  /**
  * @dev Temporary mock function. Will be removed when adding interactions with oracles
  * @param _value of the new ETH/USD conversion rate in cents
  */
  function setUSDConversionRate(uint256 _value) public {
    conversionRate.ETH_USD = _value;
  }

  /**
  * @dev Temporary mock function. Will be removed when adding interactions with oracles
  * @param _value of the new ETH/EUR conversion rate in cents
  */
  function setEURConversionRate(uint256 _value) public {
    conversionRate.ETH_EUR = _value;
  }



}
