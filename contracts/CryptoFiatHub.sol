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
  * @notice buyCUSDtokens buys pegged crypto-USD tokens.
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
  * @notice sellCryptoDollar sells CryptoDollar tokens for the equivalent USD value at which they were bought
  * @param _tokenNumber Number of CryptoDollar tokens to be sold against ether
  */
  function sellCryptoDollar(uint256 _tokenNumber) public {
      uint256 tokenBalance = cryptoDollar.balanceOf(msg.sender);
      uint256 reservedEther = cryptoDollar.guaranteedEther(msg.sender);

      require(_tokenNumber >= 0);
      require(_tokenNumber <= tokenBalance);

      uint256 paymentValue = _tokenNumber.mul(1 ether).div(exchangeRate);
      uint256 etherValue = _tokenNumber.mul(reservedEther).div(tokenBalance);

      cryptoDollar.sell(msg.sender, _tokenNumber, etherValue);
      msg.sender.transfer(paymentValue);
  }
}