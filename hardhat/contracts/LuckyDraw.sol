// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract LuckyDraw {
    uint public balance;

    constructor(uint initialBalance) {
        balance = initialBalance;
    }

    // not safe - https://stackoverflow.com/a/52472278/7874516
    function generateRandomNumber() private view returns (uint) {
        return
            uint(
                keccak256(
                    abi.encodePacked(
                        msg.sender,
                        block.difficulty,
                        block.timestamp
                    )
                )
            );
    }

    function isWinningCall() private view returns (bool) {
        return generateRandomNumber() % 2 == 0;
    }

    function takeMoneyFromWallet() private {
        balance += 1;
    }

    function takeMoneyFromBalance() private {
        balance -= 1;
    }

    function draw() public {
        if (isWinningCall()) {
            takeMoneyFromBalance();
        } else {
            takeMoneyFromWallet();
        }
    }
}
