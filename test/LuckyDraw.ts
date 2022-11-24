import { expect } from "chai";
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

  describe("Functionality", function () {
    it("Draw adds 1 or reduces by 1 if balance is 10", async function () {
      const { contract } = await deployContractFixture(10);

      const txn = await contract.draw();
      await txn.wait();

      const balance = await contract.balance();
      expect([9, 11]).to.contain(balance.toNumber());
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

      const balance = await contract.balance();
      expect([0, 1, 2, 3]).to.contain(balance.toNumber());
    })

    it("Given a starting balance of 10, when draw is called 2 times, the end balance is 8, 9, 10, 11, or 12", async function () {
      const { contract } = await deployContractFixture(10);

      let txn = await contract.draw();
      await txn.wait();

      // no error is expected as balance will remain greater than 0
      txn = await contract.draw();
      await txn.wait();

      const balance = await contract.balance();
      expect([8, 9, 10, 11, 12]).to.contain(balance.toNumber());
    })

    it("Given starting balance of 10, draw returns true if adds 1 or false if reduces by 1", async function () {
      const { contract } = await deployContractFixture(10);

      const transaction = await contract.draw();
      const transactionResult = await transaction.wait();
      const eventsResultingFromTransaction = transactionResult.events;

      if (eventsResultingFromTransaction?.length != 1) {
        throw "No events emitted"
      }

      const eventName = eventsResultingFromTransaction[0].event
      const balance = (await contract.balance()).toNumber();

      expect([balance, eventName]).to.be.deep.oneOf([[9, "won"], [11, "lost"]])
    })
  })
})
