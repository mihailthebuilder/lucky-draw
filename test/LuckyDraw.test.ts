import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

type ContractError = {
  code: string;
  message: string;
}

describe("LuckyDraw", function () {
  async function deployContractFixture(initialBalance: number) {
    const factory = await ethers.getContractFactory("LuckyDraw");
    const contract = await factory.deploy(initialBalance);
    return { contract }
  }

  describe("Deployment", function () {
    it("Can't set a balance of 0", async function () {
      let errorMessage = "";

      try {
        await deployContractFixture(0);
      } catch (err) {
        errorMessage = (err as ContractError).message;
      }

      expect(errorMessage.includes("Starting balance must be greater than 0")).to.be.true;
    })

    it("Should set the balance of 10", async function () {
      const { contract } = await deployContractFixture(10);
      expect(await contract.balance()).to.equal(10);
    })
  })

  describe("Draw feature", function () {
    it(
      `Given starting balance of 10,
        draw emits a "NewDraw" event
        and reduces the balance by 1 for a "won" event or increases the balance by 1 for a "lost" event`,
      async function () {
        const { contract } = await deployContractFixture(10);

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
        const addressUsedToExecuteTransaction = event.args[0] as string;
        expect(addressUsedToExecuteTransaction).to.equal(addressUsedToDeployContract);

        const transactionTimestampInSeconds = (event.args[1] as BigNumber).toNumber();
        const durationFromTransactionToNowInMilliseconds = Date.now() - transactionTimestampInSeconds * 1000;
        expect(durationFromTransactionToNowInMilliseconds / 60_000).to.be.lessThan(1);

        const winningDraw = (event.args[2] as boolean);
        const newBalance = (await contract.balance()).toNumber();

        if (winningDraw) {
          expect(newBalance).to.equal(9);
        } else {
          expect(newBalance).to.equal(11);
        }

        const oldBalance = event.args[3] as number;
        expect(oldBalance).to.equal(10);

        const newBalanceInEvent = event.args[4] as number
        expect(newBalanceInEvent).to.equal(newBalance);
      })

    it("Given a starting balance of 1, when draw is called 2 times, the end balance is 0, 1, 2, or 3", async function () {
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

      const balance = (await contract.balance()).toNumber();
      expect(balance).to.be.oneOf([0, 1, 2, 3]);
    })
  })
})