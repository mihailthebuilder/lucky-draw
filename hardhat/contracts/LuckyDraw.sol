// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract LuckyDraw {
    uint public balance;

    // not safe - https://stackoverflow.com/a/52472278/7874516
    function generateRandomNumber() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(msg.sender, block.difficulty)));
    }

    function isWinningCall() public view returns (bool) {
        return generateRandomNumber() % 2 == 0;
    }
}
