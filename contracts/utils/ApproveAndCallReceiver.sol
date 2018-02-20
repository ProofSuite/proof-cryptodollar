pragma solidity ^0.4.19;

contract ApproveAndCallReceiver {
    function receiveApproval(address from, uint256 _amount, address _token, bytes _data) public;
}