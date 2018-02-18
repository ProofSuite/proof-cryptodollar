pragma solidity ^0.4.18;
import "./utils/Ownable.sol";
import "./interfaces/ProofTokenInterface.sol";
import "./libraries/SafeMath.sol";
import "./libraries/CryptoFiatStorageProxy.sol";
import "./libraries/RewardsStorageProxy.sol";

contract Rewards {

  using SafeMath for uint256;
  using RewardsStorageProxy for address;
  using CryptoFiatStorageProxy for address;

  address public store;
  ProofTokenInterface public proofToken;



  /**
   * The rewards contracts handles all logic relative to the rewards for Proof Token Holders.
   * The rewards are allocated in different pools that each represent a certain epoch. The first
   * epoch starts on the store contract creation and lasts for a certain amount of blocks. The rewards
   * for each epoch are allocated to addresses in respect of the proportion of proof tokens they own at the
   * beginning of that epoch.
   *
   * @param _storeAddress {address} - Address of the Proof storage contract
   * @param _PRFTAddress {address} - Address of the Proof token address
   */
  function Rewards(address _storeAddress, address _PRFTAddress) public {
    store = _storeAddress;
    proofToken = ProofTokenInterface(_PRFTAddress);
  }

  /**
  * Simple ether transactions are reverted
  */
  function () public payable {
    revert();
  }


  /**
  * Returns the balance of the current rewards pool. The current rewards pool is incremented
  * everytime the receiveRewards() function is called. When a new epoch starts, the current pool
  * balance is set to 0 and transfer to the pool balance corresponding to the epoch index
  *
  * @return {uint256} - Current Pool Balance
  */
  function getCurrentPoolBalance() public constant returns (uint256) {
    return store.getCurrentPoolBalance();
  }

  /**
  * Returns the balance of the rewards pool corresponding to the _index argument.

  * @param _index {uint256}
  * @return {uint256} - Nth pool balance
  */
  function getNthPoolBalance(uint256 _index) public constant returns (uint256) {
    return store.getNthPoolBalance(_index);
  }

  /**
  * receiveRewards() updates the current pool balance with the received value.
  * In addition to that, it also checks if a new epoch has been reached. If a new epoch is reached:
  * - the pool balance corresponding to the current epoch is set to the current pool balance
  * - the current pool balance is set to 0
  * - the current epoch is incremented
  */
  function receiveRewards() public payable {
    require(msg.value > 0);

    uint256 currentEpoch = store.getCurrentEpoch();
    if (getCurrentEpoch() > currentEpoch) {
      uint256 currentPoolBalance = store.getCurrentPoolBalance();
      store.setNthPoolBalance(currentEpoch, currentPoolBalance);
      store.setCurrentPoolBalance(0);
      store.incrementCurrentEpoch(1);
    }

    store.incrementCurrentPoolBalance(msg.value);
  }

  /**
  * withdrawRewards() sends proof rewards to the msg.sender address.
  * First, withdrawRewards() checks if a new epoch has been reached. If a new epoch is reached:
  * - the pool balance corresponding to the current epoch is set to the current pool balance
  * - the current pool balance is set to 0
  * - the current epoch is incremented
  *
  * The amount of rewards for each address for an epoch N is equal to:
  *   NthPoolBalance * balanceAtEpochStart / totalSupply
  * where:
  * - NthPoolBalance is the pool balance corresponding to epoch N
  * - balanceAtEpochStart is the proof token balance of msg.sender at the start of epoch N
  * - totalSupply is the total supply of proof tokens
  * The total reward amount is therefore equal to the sum of rewards by epoch over all epochs
  * after the last withdrawal by the same address has been made.
  *
  * If the rewards request is valid and accepted, the last withdrawal is set to the current epoch
  * and the reward value is sent to the msg.sender
  */
  function withdrawRewards() public {
    require(msg.sender != 0x0);

    uint256 lastEpoch = store.getCurrentEpoch();
    uint256 currentEpoch = getCurrentEpoch();

    if (currentEpoch != lastEpoch) {
      uint256 currentPoolBalance = store.getCurrentPoolBalance();
      store.setNthPoolBalance(lastEpoch, currentPoolBalance);
      store.setCurrentPoolBalance(0);
      store.setCurrentEpoch(currentEpoch);
    }

    uint256 withdrawalValue = 0;
    uint256 lastWithdrawal = store.getAccountLastWithdrawal(msg.sender);
    lastEpoch = store.getCurrentEpoch();
    require(lastWithdrawal != lastEpoch);

    for (uint256 i = lastWithdrawal; i < lastEpoch; i++) {
      uint256 blockNumberAtEpochStart = getBlockNumberAtEpochStart(i);
      uint256 balanceAtEpochStart = proofToken.balanceOfAt(msg.sender, blockNumberAtEpochStart);
      uint256 totalSupply = proofToken.totalSupply();
      currentPoolBalance = (store.getNthPoolBalance(i) * balanceAtEpochStart) / totalSupply;
      withdrawalValue = withdrawalValue + currentPoolBalance;
    }

    require(withdrawalValue != 0);
    require(withdrawalValue < this.balance);
    store.setAccountLastWithdrawal(msg.sender, lastEpoch);
    msg.sender.transfer(withdrawalValue);
  }


  /**
   * Epochs separate the different pools of rewards (see description of withdrawRewards() and receiveRewards())
   * @return currentEpoch {uint256} - Number corresponding to the current epoch
   */
  function getCurrentEpoch() public view returns(uint256 currentEpoch) {
    uint256 creationBlockNumber = store.getCreationBlockNumber();
    uint256 blocksPerEpoch = store.getBlocksPerEpoch();

    currentEpoch = (block.number - creationBlockNumber) / blocksPerEpoch;
    return currentEpoch;
  }

  /**
   * getBlockNumberAtEpochStart() returns the block number corresponding to the start of an epoch.
   * The first epoch is set to start when the cryptofiat network is initially deployed
   *
   * @param _epoch {uint256}
   * @return blockNumber {uint256}
   */
  function getBlockNumberAtEpochStart(uint256 _epoch) public view returns(uint256 blockNumber) {
    uint256 creationBlockNumber = store.getCreationBlockNumber();
    uint256 blocksPerEpoch = store.getBlocksPerEpoch();
    blockNumber = creationBlockNumber + blocksPerEpoch * _epoch;

    return blockNumber;
  }

}