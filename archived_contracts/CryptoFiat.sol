pragma solidity ^0.4.11;


import './SafeMath.sol';
import './Pausable.sol';
import './CryptoDollarToken.sol';
import './CryptoEuroToken.sol';


/**
 * @title Crowdsale 
 * @dev Crowdsale is a base contract for managing a token crowdsale.
 * Crowdsales have a start and end block, where investors can make
 * token purchases and the crowdsale will assign them tokens based
 * on a token per ETH rate. Funds collected are forwarded to a wallet 
 * as they arrive.
 */
 
contract CryptoFiat {
  using SafeMath for uint256;

  CryptoEuroToken public cryptoEuroToken;
  CryptoDollarToken public cryptoDollarToken;

  // amount of raised money in wei
  uint256 public totalEther;

  uint256 public euroConversionRate;
  uint256 public dollarConversionRate;

  string public contactInformation;

  bool private reEntrancyLock = false;

  uint256 public totalCryptoEuro = 0;
  uint256 public totalCryptoDollar = 0;

  uint256 private temp;

  

  /**
   * event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */ 
  event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
  event buyCryptoDollar(address indexed purchaser, uint256 indexed weiAmount, uint256 indexed tokenAmount);
  event buyCryptoEuro(address indexed purchaser, uint256 weiAmount, uint256 tokenAmount);
  event sellCryptoDollar(address indexed purchaser, uint256 weiAmount, uint256 tokenAmount);
  event sellCryptoEuro(address indexed purchaser, uint256 weiAmount, uint256 tokenAmount);



  /**
   * crowdsale constructor
   * @param _euroConversionRate number of ethers received for every euro invested
   * @param _dollarConversionRate number of ethers received for every dollar invested
   */ 

  function CryptoFiat(uint256 _dollarConversionRate, uint256 _euroConversionRate) {

    require(_dollarConversionRate > 0);
    require(_euroConversionRate > 0);

    cryptoEuroToken = new CryptoEuroToken();
    cryptoDollarToken = new CryptoDollarToken();
    euroConversionRate = _euroConversionRate;
    dollarConversionRate = _dollarConversionRate;

  }

  function () payable {
  }

  function buyCryptoEuroTokens() public payable {
      require(msg.sender != 0x0);
    //   require(validPurchase());

      uint256 weiAmount = msg.value;
      uint256 tokenAmount = weiAmount.mul(euroConversionRate).div(1 ether);

      totalEther = totalEther.add(weiAmount);
      totalCryptoEuro = totalCryptoEuro.add(tokenAmount);

      cryptoEuroToken.buy(msg.sender, tokenAmount);
      buyCryptoEuro(msg.sender, weiAmount, tokenAmount);

  }

  function buyCryptoDollarTokens() public payable {
      require(msg.sender != 0x0);
    //   require(validPurchase());

      uint256 weiAmount = msg.value;
      uint256 tokenAmount = weiAmount.mul(dollarConversionRate).div(1 ether);

      totalEther = totalEther.add(weiAmount);
      totalCryptoDollar = totalCryptoDollar.add(tokenAmount);

      cryptoDollarToken.buy(msg.sender, tokenAmount);
      buyCryptoDollar(msg.sender, weiAmount, tokenAmount);
      
  }

  function sellCryptoEuroTokens(uint256 tokenNb) public {
      require(tokenNb >= 0);
      require(tokenNb <= cryptoEuroToken.balanceOf(msg.sender));
    //   require(validPurchase());

      uint256 weiAmount = tokenNb.mul(1 ether).div(euroConversionRate);


      msg.sender.transfer(weiAmount);
      totalEther = totalEther.sub(weiAmount);
      totalCryptoEuro = totalCryptoEuro.sub(tokenNb);

      cryptoEuroToken.sell(msg.sender, tokenNb);
      buyCryptoEuro(msg.sender, weiAmount, tokenNb);


  }

  function sellCryptoDollarTokens(uint256 tokenNb) public {
      require(tokenNb >= 0);
      require(tokenNb <= cryptoDollarToken.balanceOf(msg.sender));
    //   require(validPurchase());

      
      uint256 weiAmount = tokenNb.mul(1 ether).div(dollarConversionRate);

      msg.sender.transfer(weiAmount);
      totalEther = totalEther.sub(weiAmount);
      totalCryptoDollar = totalCryptoDollar.sub(tokenNb);

      cryptoDollarToken.sell(msg.sender, tokenNb);
      sellCryptoDollar(msg.sender, weiAmount, tokenNb);

  }

  function cryptoDollarBalance(address _owner) public constant returns(uint256 cryptoDollarBalance) {
      return cryptoDollarToken.balanceOf(_owner);
  }

  function cryptoEuroBalance(address _owner) public constant returns(uint256 cryptoEuroBalance) {
    return cryptoEuroToken.balanceOf(_owner);
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
