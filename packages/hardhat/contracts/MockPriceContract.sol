// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "usingtellor/contracts/UsingTellor.sol";

contract MockPriceContract is UsingTellor {

  uint256 public btcPrice;
  uint256 public btcPriceShadow;

  constructor(address payable _tellorAddress) UsingTellor(_tellorAddress) {}

  function setBtcPrice() public {
    btcPrice = btcPriceShadow;

    // bytes memory _b = abi.encode("SpotPrice",abi.encode("btc","usd"));
    // bytes32 _queryId = keccak256(_b);

    // uint256 _timestamp;
    // bytes memory _value;

    // (_value, _timestamp) = getDataBefore(_queryId, block.timestamp - 15 minutes);

    // require(_timestamp > 0, "No data exists");
    // require(block.timestamp - _timestamp < 24 hours, "Data is too old");

    // btcPrice = abi.decode(_value,(uint256));
  }

  function setBtcPriceShadow(uint256 price) public {
    btcPriceShadow = price;
  }

}