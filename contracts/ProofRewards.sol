pragma solidity ^0.4.18;
import "./utils/Ownable.sol";
import "./interfaces/ProofTokenInterface.sol";
import "./libraries/SafeMath.sol";
import "./libraries/RewardsStorageProxy.sol";

contract ProofRewards {

  using SafeMath for uint256;
  using RewardsStorageProxy for address;

  address public store;
  ProofTokenInterface public proofToken;
  uint256 totalSupply;

  function ProofRewards(address _storeAddress, address _PRFTAddress) public {
    store = _storeAddress;
    proofToken = ProofTokenInterface(_PRFTAddress);
    totalSupply = proofToken.totalSupply();

  }

  function () public payable {
    revert();
  }

  function receiveDividends() payable public {
    store.incrementCurrentPoolBalance(msg.value);
  }

  function currentPoolBalance() public constant returns (uint256) {
    return store.getCurrentPoolBalance();
  }

}