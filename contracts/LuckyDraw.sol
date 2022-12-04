// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract LuckyDraw {
    uint public prize;

    constructor(uint inputPrize) payable {
        require(msg.value > 0, "You need to send some Ether to the contract");
        // require(startingBalance > 0, "Starting balance must be greater than 0");
        prize = inputPrize;
    }

    function draw() public {
        uint oldBalance = balance;

        if (isWinningCall()) {
            require(balance >= 1, "Insufficient balance in contract");
            withdrawFromBalance();
            emit NewDraw(
                msg.sender,
                block.timestamp,
                true,
                oldBalance,
                balance
            );
        } else {
            addToBalance();
            emit NewDraw(
                msg.sender,
                block.timestamp,
                false,
                oldBalance,
                balance
            );
        }
    }

    function isWinningCall() private view returns (bool) {
        return generateRandomNumber() % 2 == 0;
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

    function addToBalance() private {
        balance += 1;
    }

    function withdrawFromBalance() private {
        balance -= 1;
    }

    event NewDraw(
        address indexed from,
        uint256 indexed timestamp,
        bool indexed won,
        uint oldBalance,
        uint newBalance
    );
}
