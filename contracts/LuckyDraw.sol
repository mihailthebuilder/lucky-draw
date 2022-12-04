// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract LuckyDraw {
    uint public prize;

    constructor(uint inputPrize) payable {
        require(msg.value > 0, "Send some Ether to deploy the contract");
        require(inputPrize > 0, "Set a prize greater than 0");
        require(msg.value > inputPrize, "Prize is greater than inital balance");

        prize = inputPrize;
    }

    function draw() public {
        uint oldBalance = address(this).balance;
        bool wonTheDraw = isWinningCall();

        if (wonTheDraw) {
            require(oldBalance >= prize, "Insufficient balance in contract");
            awardPrize();
        }

        emit NewDraw(
            msg.sender,
            block.timestamp,
            wonTheDraw,
            oldBalance,
            address(this).balance
        );
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

    function awardPrize() private {
        (bool success, ) = msg.sender.call{value: prize}("");
        require(success, "Failed to send Ether");
    }

    event NewDraw(
        address indexed from,
        uint256 indexed timestamp,
        bool indexed won,
        uint oldBalance,
        uint newBalance
    );
}
