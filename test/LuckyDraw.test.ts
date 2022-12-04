import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { ethers } from "hardhat";

type ContractError = {
  code: string;
  message: string;
}

describe("LuckyDraw", function () {

  async function deployContractFixture(initialBalance: number, prize: number) {
    const factory = await ethers.getContractFactory("LuckyDraw");
    const contract = await factory.deploy(ethers.utils.parseEther(prize.toString()), { value: ethers.utils.parseEther(initialBalance.toString()) });
    return { contract }
  }

  describe("Deployment", function () {

    it("Should set the balance of 10 ether and prize of 1 ether", async function () {
      const { contract } = await deployContractFixture(10, 1);

      const balance = await ethers.provider.getBalance(
        contract.address
      );

      expect(balance).to.equal(ethers.utils.parseEther("10"), "initial balance isn't 10 ether");

      const prize = await contract.prize();
      expect(prize).to.equal(ethers.utils.parseEther("1"), "prize isn't 10 ether");
    })

    it("Should fail to deploy if initial balance is 0", async function () {
      let errorMessage = "";

      try {
        await deployContractFixture(0, 10);
      } catch (err) {
        errorMessage = (err as ContractError).message;
      }

      expect(errorMessage).to.include("Send some Ether to deploy the contract");
    })

    it("Should fail to deploy if prize is 0", async function () {
      let errorMessage = "";

      try {
        await deployContractFixture(10, 0);
      } catch (err) {
        errorMessage = (err as ContractError).message;
      }

      expect(errorMessage).to.include("Set a prize greater than 0")
    });

    it("Should fail to deploy if initial balance is less than prize", async function () {
      let errorMessage = "";

      try {
        await deployContractFixture(5, 10);
      } catch (err) {
        errorMessage = (err as ContractError).message;
      }

      expect(errorMessage).to.include("Prize is greater than inital balance")
    });
  })

  describe("Draw feature", function () {
    it(
      `Given starting balance of 10 ETH
        and a prize of 0.0001 ETH
        when draw is called once
        then a "NewDraw" event is emitted
        and the balance is reduced by 0.0001 ETH for a "won" event, or remains unchanged a "lost" event`,
      async function () {
        const startingBalance = 10;
        const prize = 0.0001;

        const { contract } = await deployContractFixture(startingBalance, prize);

        const transaction = await contract.draw();
        const transactionResult = await transaction.wait();
        const eventsResultingFromTransaction = transactionResult.events;

        if (!eventsResultingFromTransaction?.length) {
          throw "No events emitted"
        }

        expect(eventsResultingFromTransaction?.length).to.equal(1);

        const event = eventsResultingFromTransaction[0];

        expect(event.event).to.equal("NewDraw");

        if (!event.args) {
          throw "No arguments passed to event"
        }

        /* 
        ideally you want to execute transaction with a custom wallet address that you 
        then test for, not the address of the contract deployed. 
        */
        const addressUsedToDeployContract = await contract.signer.getAddress();
        const addressUsedToExecuteTransaction = event.args.from as string;
        expect(addressUsedToExecuteTransaction).to.equal(addressUsedToDeployContract);

        const transactionTimestampInSeconds = (event.args.timestamp as BigNumber).toNumber();
        const durationFromTransactionToNowInMilliseconds = Date.now() - transactionTimestampInSeconds * 1000;
        expect(durationFromTransactionToNowInMilliseconds / 60_000).to.be.lessThan(1);

        const winningDraw = (event.args.won as boolean);
        const balanceAfterDraw = convertWeiToEther(await ethers.provider.getBalance(contract.address));

        if (winningDraw) {
          expect(balanceAfterDraw).to.equal(startingBalance - prize, "new balance should be reduced by prize if won");
        } else {
          expect(balanceAfterDraw).to.equal(startingBalance);
        }

        const oldBalance = convertWeiToEther(event.args.oldBalance as number);
        expect(oldBalance).to.equal(10);

        const newBalanceInEvent = convertWeiToEther(event.args.newBalance as number);
        expect(newBalanceInEvent).to.equal(balanceAfterDraw, "new balance in event should match new balance");
    it(
      `Given a starting balance of 1, 
      when draw is called 2 times, 
      then 1 or 2 events were emitted
      and the end balance is 0, 1, or 3`,
      async function () {
        const { contract } = await deployContractFixture(1);

        // balance either decreases to 0, or increases to 2
        const txn = await contract.draw();
        await txn.wait();

        // 2nd call might be reverted if the balance is 0
        try {
          const txn = await contract.draw();
          await txn.wait();
        } catch (err) {
          const errorMessage = (err as ContractError).message;
          if (!errorMessage.includes("Insufficient balance in contract")) {
            throw err;
          }
        }

        const eventFilter = contract.filters["NewDraw(address,uint256,bool,uint256,uint256)"]()
        const events = await contract.queryFilter(eventFilter)
        const balance = (await contract.balance()).toNumber();

        if (events.length === 2) {
          expect(balance).to.be.oneOf([1, 3])
        } else if (events.length === 1) {
          expect(balance).to.equal(0)
        }
      })


const convertWeiToEther = (wei: BigNumberish) => Number(ethers.utils.formatEther(wei));