
pragma solidity 0.4.18;

import "../utils/Ownable.sol";

contract StoreInterface is Ownable {

    modifier onlyStoreInterface() {_;}

    function getAddress(bytes32 _key) external view returns (address);
    function getUint(bytes32 _key) external view returns (uint);
    function getString(bytes32 _key) external view returns (string);
    function getBool(bytes32 _key) external view returns (bool);
    function getInt(bytes32 _key) external view returns (int);

    function setAddress(bytes32 _key, address _value) onlyStoreInterface external;
    function setUint(bytes32 _key, uint _value) onlyStoreInterface external;
    function setString(bytes32 _key, string _value) onlyStoreInterface external;
    function setBool(bytes32 _key, bool _value) onlyStoreInterface external;
    function setInt(bytes32 _key, int _value) onlyStoreInterface external;

    function deleteAddress(bytes32 _key) onlyStoreInterface external;
    function deleteUint(bytes32 _key) onlyStoreInterface external;
    function deleteString(bytes32 _key) onlyStoreInterface external;
    function deleteBool(bytes32 _key) onlyStoreInterface external;
    function deleteInt(bytes32 _key) onlyStoreInterface external;

}