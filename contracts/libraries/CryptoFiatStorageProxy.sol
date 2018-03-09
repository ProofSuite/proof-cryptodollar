pragma solidity ^0.4.19;

import "../interfaces/StoreInterface.sol";


library CryptoFiatStorageProxy {

    /**
    * @notice Dividends functions can only be called through the proof network
    * @notice In its current form, the proof network consists of the Cryptofiat and the AMP Manager contracts
    */

    function getCreationTimestamp(address _store) public view returns(uint256) {
        return StoreInterface(_store).getUint(keccak256("cryptofiat.creationTimestamp"));
    }

    function getCreationBlockNumber(address _store) public view returns(uint256) {
        return StoreInterface(_store).getUint(keccak256("cryptofiat.creationBlockNumber"));
    }


    function setCreationTimestamp(address _store, uint256 _value) public {
        StoreInterface(_store).setUint(keccak256("cryptofiat.creationTimestamp"), _value);
    }

    function setCreationBlockNumber(address _store, uint256 _value) public {
        StoreInterface(_store).setUint(keccak256("cryptofiat.creationBlockNumber"), _value);
    }

}