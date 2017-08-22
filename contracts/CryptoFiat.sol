pragma solidity ^0.4.11;


import './SafeMath.sol';
import './Pausable.sol';
import './CUSDToken.sol';
import './CEURToken.sol';


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

  struct ConversionRate {
    uint256 ETH_USD;
    uint256 ETH_EUR;
  }
  ConversionRate public conversionRate;

  uint256 public dividends;
  enum State{ PEGGED, UNPEGGED }

   
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
  event BuyCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event BuyCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellUnpeggedCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellUnpeggedCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event BufferValue(uint256 value);


  
  function CryptoFiat() {

    CEUR = new CEURToken();
    CUSD = new CUSDToken();
    conversionRate.ETH_USD = 25000;
    conversionRate.ETH_EUR = 20000;
    dividends = 0;

  }

  function () payable {
      revert();
  }

  /**
  * @notice capitalize contract
  */
  function capitalize() public payable {}

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

      dividends = dividends.add(tokenHoldersFee);
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

      dividends = dividends.add(tokenHoldersFee);
      uint256 tokenAmount = paymentValue.mul(conversionRate.ETH_USD).div(1 ether);

      CUSD.buy(msg.sender, tokenAmount, paymentValue);
      BuyCUSD(msg.sender, value, tokenAmount);
  }


  /**
  * @notice sellCEURTokens sells crypto-EUR tokens for the equivalent EUR value at which they were bought
  * @param tokenNumber is the number of tokens to be sold
  */
  function sellCEURTokens(uint256 tokenNumber) public {
      require(tokenNumber >= 0);
      require(tokenNumber <= CEUR.balanceOf(msg.sender));
      require(currentState(tokenNumber, "EUR") == State.PEGGED);

      uint256 paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_EUR);
      msg.sender.transfer(paymentValue);

      CEUR.sell(msg.sender, tokenNumber, paymentValue);
      SellCEUR(msg.sender, paymentValue, tokenNumber);
  }


  /**
  * @notice sellCUSDTokens sells crypto-USD tokens for the equivalent USD value at which they were bought
  * @param tokenNumber is the number of tokens to be sold
  */
  function sellCUSDTokens(uint256 tokenNumber) public {
      require(tokenNumber >= 0);
      require(tokenNumber <= CUSD.balanceOf(msg.sender));
      require(currentState(tokenNumber, "USD") == State.PEGGED);

      uint256 paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_USD);
      msg.sender.transfer(paymentValue);

      CUSD.sell(msg.sender, tokenNumber, paymentValue);
      SellCUSD(msg.sender, paymentValue, tokenNumber);

  }


  /**
  * @notice sellUnpeggedCEUR sells crypto-EUR tokens for the equivalent ether value at which they were bought
  * @dev Need to replace inState by inFutureState to account for the possibility the contract could become unpegged with the current transaction
  * @param tokenNumber is the number of tokens to be sold
  */
  function sellUnpeggedCEUR(uint256 tokenNumber) inState(State.UNPEGGED) public {
    uint256 tokenBalance = CEUR.balanceOf(msg.sender);
    uint256 guaranteedEther = CEUR.reservedEther(msg.sender);
    

    require(tokenNumber >= 0);
    require(tokenNumber <= tokenBalance);

    uint256 paymentValue = guaranteedEther.div(tokenBalance).mul(tokenNumber);
    msg.sender.transfer(paymentValue);
    
    CEUR.sell(msg.sender, tokenNumber, paymentValue);
    SellCEUR(msg.sender, paymentValue, tokenNumber);

  }
    

  /**
  * @notice sellUnpeggedCUSD sells crypto-USD tokens for the equivalent ether value at which they were bought
  * @dev Need to replace inState by inFutureState to account for the possibility the contract could become unpegged with the current transaction
  * @param tokenNumber is the number of tokens to be sold
  */
  function sellUnpeggedCUSD(uint256 tokenNumber) inState(State.UNPEGGED) public {
    uint256 tokenBalance = CUSD.balanceOf(msg.sender);
    uint256 guaranteedEther = CUSD.reservedEther(msg.sender);

    require(tokenNumber >= 0);
    require(tokenNumber <= tokenBalance);

    uint256 paymentValue = guaranteedEther.div(tokenBalance).mul(tokenNumber);
    msg.sender.transfer(paymentValue);

    CUSD.sell(msg.sender, tokenNumber, paymentValue);
    SellCUSD(msg.sender, paymentValue, tokenNumber);

  }


  /**
  * @notice getCEURTokenValue returns the value of tokens depending on current contract state
  * @param tokenNumber : Number of tokens to be valued
  * @return value of the tokens
  */
  function getCEURTokenValue(uint256 tokenNumber) public constant returns (uint256 value) {

    uint256 tokenBalance = CEUR.balanceOf(msg.sender);
    uint256 guaranteedEther = CEUR.reservedEther(msg.sender);
    uint256 paymentValue;

    if (currentState() == State.PEGGED) {
      paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_EUR);
    } else {
      paymentValue = guaranteedEther.mul(tokenNumber).div(tokenBalance);
    }
    return paymentValue;
  }


  /**
  * @notice getCUSDTokenValue returns the value of tokens depending on current contract state
  * @param tokenNumber : Number of tokens to be valued
  * @return value of the tokens
  */
  function getCUSDTokenValue(uint256 tokenNumber) public constant returns (uint256) {
    uint256 tokenBalance = CUSD.balanceOf(msg.sender);
    uint256 guaranteedEther = CUSD.reservedEther(msg.sender);
    uint256 paymentValue;
    
    
    if (currentState() == State.PEGGED) {
      paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_USD);
    } else {
      paymentValue = guaranteedEther.mul(tokenNumber).div(tokenBalance);
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
  * @param _owner 
  * @return the crypto-USD token balance of _owner
  */
  function CUSDBalance(address _owner) public constant returns(uint256) {
    return CUSD.balanceOf(_owner);
  }

  /**
  * @notice This function is probably not needed
  * @param _owner 
  * @return the crypto-EUR token balance of _owner
  */
  function CEURBalance(address _owner) public constant returns(uint256) {
    return CEUR.balanceOf(_owner);
  }

  /**
  * @notice This function is not needed
  * @return total supply of crypto-USD
  */
  function CUSDTotalSupply() public constant returns(uint256) {
    return CUSD.totalSupply();
  }

  /**
  * @notice This function is not needed
  * @return total supply of crypto-EUR
  */
  function CEURTotalSupply() public constant returns(uint256) {
    return CEUR.totalSupply();
  }

  /**
  * @notice This function is not needed
  * @dev Need to make sure tests do not use this function
  * @return total supply of crypto-EUR
  */
  function totalBalance() public constant returns (uint256) {
    return this.balance;
  }


  /**
  * @return the total value in ether of the crypto-USD and crypto-EUR tokens that have been issued
  */
  function totalCryptoFiatValue() public constant returns(uint256) {
    uint256 CUSDSupply = CUSD.totalSupply();
    uint256 CEURSupply = CEUR.totalSupply();
    uint256 total = CUSDSupply.mul(1 ether).div(conversionRate.ETH_USD) + CEURSupply.mul(1 ether).div(conversionRate.ETH_EUR);
    return total;
  }

  /**
  * @return buffer value
  */
  function buffer() public constant returns (int) {
    int value = int(this.balance - dividends - totalCryptoFiatValue());
    return value;
  }


  /** 
  * @return conversionRate
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
  * @return State of the contract
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
  * @param tokenNumber the number of tokens being sold
  * @param currency which currency token is being sold
  * @return State of the contract
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
  * @param _value of the new ETH/USD conversion rate in cents
  */
  function setUSDConversionRate(uint256 _value) public {
    conversionRate.ETH_USD = _value;
  }

  /**
  * @param _value of the new ETH/EUR conversion rate in cents
  */
  function setEURConversionRate(uint256 _value) public {
    conversionRate.ETH_EUR = _value;
  }


  


}
