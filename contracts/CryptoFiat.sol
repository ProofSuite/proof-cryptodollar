pragma solidity ^0.4.11;


import './SafeMath.sol';
import './Pausable.sol';
import './CUSDToken.sol';
import './CEURToken.sol';


/**
 * @title Crowdsale 
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end block, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet 
 * as they arrive.
 */
 
contract CryptoFiat is Pausable {
  using SafeMath for uint256;

  CUSDToken public CUSD;
  CEURToken public CEUR;

  string public contactInformation;
  bool private reEntrancyLock = false;

  struct ConversionRate {
    uint256 ETH_USD;
    uint256 ETH_EUR;
  }

  struct ContractBalances {
      uint256 totalProofTokenHolders;
      uint256 totalCryptoTokenHolders;
  }

  struct UserBalance {
      uint256 forEUR;
      uint256 forUSD;
  }

  mapping (address => UserBalance) public userBalances;
  ConversionRate public conversionRate;
  ContractBalances public contractBalance;
  
  enum State{ PEGGED, UNPEGGED }

  

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value in weis paid for purchase
   * @param amount amount of tokens purchased
   */ 
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
  event BuyCUSD(address indexed purchaser, uint256 indexed paymentValue, uint256 indexed tokenAmount);
  event BuyCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellUnpeggedCUSD(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);
  event SellUnpeggedCEUR(address indexed purchaser, uint256 paymentValue, uint256 tokenAmount);



  /**
   * crowdsale constructor
   */ 

  function CryptoFiat() {

    CEUR = new CEURToken();
    CUSD = new CUSDToken();
    conversionRate.ETH_USD = 25445;
    conversionRate.ETH_EUR = 23013;
    contractBalance.totalProofTokenHolders = 0;
    contractBalance.totalCryptoTokenHolders = 0;

  }

  function () payable {
      revert();
  }

  function capitalize() public payable {

  }

  function buyCEURTokens() nonReentrant public payable {
      require(msg.sender != 0x0);
      require(msg.value > 0);

      uint256 value = msg.value;
      uint256 tokenHoldersFee = value.div(200);
      uint256 bufferFee = value.div(200);
      uint256 finalValue = value - tokenHoldersFee - bufferFee;

      contractBalance.totalProofTokenHolders = contractBalance.totalProofTokenHolders.add(tokenHoldersFee);
      contractBalance.totalCryptoTokenHolders = contractBalance.totalCryptoTokenHolders.add(finalValue);
      userBalances[msg.sender].forEUR = userBalances[msg.sender].forEUR.add(finalValue);

      uint256 tokenAmount = finalValue.mul(conversionRate.ETH_EUR).div(1 ether);
      CEUR.buy(msg.sender, tokenAmount);
      BuyCEUR(msg.sender, value, tokenAmount);

  }

  function buyCUSDTokens() nonReentrant public payable {
      require(msg.sender != 0x0);
      require(msg.value > 0);

      uint256 value = msg.value;
      uint256 tokenHoldersFee = value.div(200);
      uint256 contractFee = value.div(200);
      uint256 finalValue = value - tokenHoldersFee - contractFee;

      contractBalance.totalProofTokenHolders = contractBalance.totalProofTokenHolders.add(tokenHoldersFee);
      contractBalance.totalCryptoTokenHolders = contractBalance.totalCryptoTokenHolders.add(finalValue);
      userBalances[msg.sender].forUSD = userBalances[msg.sender].forUSD.add(finalValue);
      
      uint256 tokenAmount = finalValue.mul(conversionRate.ETH_USD).div(1 ether);
      CUSD.buy(msg.sender, tokenAmount);
      BuyCUSD(msg.sender, value, tokenAmount);

  }

  function sellCEURTokens(uint256 tokenNumber) nonReentrant inState(State.PEGGED) public {
      require(tokenNumber >= 0);
      require(tokenNumber <= CEUR.balanceOf(msg.sender));

      uint256 paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_EUR);
      msg.sender.transfer(paymentValue);
      contractBalance.totalCryptoTokenHolders.sub(paymentValue);
      userBalances[msg.sender].forEUR = userBalances[msg.sender].forEUR.sub(paymentValue);

      CEUR.sell(msg.sender, tokenNumber);
      SellCEUR(msg.sender, paymentValue, tokenNumber);
  }

  function sellCUSDTokens(uint256 tokenNumber) nonReentrant inState(State.PEGGED) public {
      require(tokenNumber >= 0);
      require(tokenNumber <= CUSD.balanceOf(msg.sender));

      uint256 paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_USD);
      msg.sender.transfer(paymentValue);
      contractBalance.totalCryptoTokenHolders.sub(paymentValue);
      userBalances[msg.sender].forUSD = userBalances[msg.sender].forUSD.sub(paymentValue);

      CUSD.sell(msg.sender, tokenNumber);
      SellCUSD(msg.sender, paymentValue, tokenNumber);
  }

  function sellUnpeggedCEUR(uint256 tokenNumber) nonReentrant inState(State.UNPEGGED) public {
    uint256 tokenBalance = CEUR.balanceOf(msg.sender);

    require(tokenNumber >= 0);
    require(tokenNumber <= tokenBalance);


    uint256 paymentValue = (userBalances[msg.sender].forEUR).mul(tokenNumber).div(tokenBalance);
    contractBalance.totalCryptoTokenHolders.sub(paymentValue);
    userBalances[msg.sender].forEUR = userBalances[msg.sender].forEUR - paymentValue;
      

    msg.sender.transfer(paymentValue);
    CEUR.sell(msg.sender, tokenNumber);
    SellCEUR(msg.sender, paymentValue, tokenNumber);

  }

  function sellUnpeggedCUSD(uint256 tokenNumber) nonReentrant inState(State.UNPEGGED) public {
    uint256 tokenBalance = CUSD.balanceOf(msg.sender);
    
    require(tokenNumber >= 0);
    require(tokenNumber <= tokenBalance);

    uint256 paymentValue = (userBalances[msg.sender].forEUR).mul(tokenNumber).div(tokenBalance);
    contractBalance.totalCryptoTokenHolders.sub(paymentValue);
    userBalances[msg.sender].forUSD = userBalances[msg.sender].forUSD - paymentValue;

    msg.sender.transfer(paymentValue);
    CUSD.sell(msg.sender, tokenNumber);
    SellCUSD(msg.sender, paymentValue, tokenNumber);

  }

  function getCEURTokenValue(uint256 tokenNumber) public constant nonReentrant returns (uint256) {

    uint256 tokenBalance = CEUR.balanceOf(msg.sender);
    uint256 paymentValue;

    if (currentState() == State.PEGGED) {
      paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_EUR);
    } else {
      paymentValue = (userBalances[msg.sender].forEUR).mul(tokenNumber).div(tokenBalance);
    }
    return paymentValue;
  } 

  function getCUSDTokenValue(uint256 tokenNumber) public constant nonReentrant returns (uint256) {
    uint256 tokenBalance = CUSD.balanceOf(msg.sender);
    uint256 paymentValue;
    if (currentState() == State.PEGGED) {
      paymentValue = tokenNumber.mul(1 ether).div(conversionRate.ETH_USD);
    } else {
      paymentValue = (userBalances[msg.sender].forEUR).mul(tokenNumber).div(tokenBalance);
    }
    return paymentValue;
  }
  

  function CUSDBalance(address _owner) public constant returns(uint256) {
    return CUSD.balanceOf(_owner);
  }

  function CEURBalance(address _owner) public constant returns(uint256) {
    return CEUR.balanceOf(_owner);
  }

  function CUSDTotalSupply() public constant returns(uint256) {
    return CUSD.totalSupply();
  }

  function CEURTotalSupply() public constant returns(uint256) {
    return CEUR.totalSupply();
  }

  function buffer() public constant returns (uint256) {
      return (this.balance - contractBalance.totalProofTokenHolders - contractBalance.totalCryptoTokenHolders);
  }

  
 
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

  function currentState() public constant returns (State) {
    if (buffer() > 0) {
      return State.PEGGED;
    } else {
      return State.UNPEGGED;
    }
  }

  function changeUSDConversionRate(uint256 _value) public {
    conversionRate.ETH_USD = _value;
  }

  function changeEURConversionRate(uint256 _value) public {
    conversionRate.ETH_EUR = _value;
  }

  function futureState(uint256 tokenNumber, string currency) public constant returns (State) {
    uint256 rate = conversionRate(currency);
    if (buffer() < tokenNumber.mul(rate)) {
      return State.PEGGED;
    } else {
      return State.UNPEGGED;
    }
  }
  
  /**
   * 
   * @author Remco Bloemen <remco@2π.com>
   * @dev Prevents a contract from calling itself, directly or indirectly.
   * @notice If you mark a function `nonReentrant`, you should also
   * mark it `external`. Calling one nonReentrant function from
   * another is not supported. Instead, you can implement a
   * `private` function doing the actual work, and a `external`
   * wrapper marked as `nonReentrant`.
   */
  
  // TODO need to set nonReentrant modifier where necessary

  modifier nonReentrant() {
    require(!reEntrancyLock);
    reEntrancyLock = true;
    _;
    reEntrancyLock = false;
  }


}
