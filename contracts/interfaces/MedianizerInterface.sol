/// medianizer.sol - read ds-values and output median

// Copyright (C) 2017, 2018  DappHub, LLC

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.4.18;

contract MedianizerInterface
{
    event LogValue(bytes32 val);
    mapping (bytes12 => address) public values;
    mapping (address => bytes12) public indexes;
    bytes12 public next = 0x1;
    uint96 public min = 0x1;

    function set(address wat) public;
    function set(bytes12 pos, address wat) public;
    function setMin(uint96 min_) public;
    function setNext(bytes12 next_) public;
    function unset(bytes12 pos) public;
    function unset(address wat) public;
    function poke() public;
    function poke(bytes32) public;
    function peek() external view returns (bytes32, bool);
    function compute() public view returns (bytes32, bool);

}