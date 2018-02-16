pragma solidity ^0.4.18;

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract RewardsInterface {

    function receiveRewards() payable public;
    function withdrawRewards() public;

}
