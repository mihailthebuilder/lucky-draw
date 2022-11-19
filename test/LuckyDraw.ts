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
    it("Should set the balance of 0", async function () {
      const { contract } = await deployContractFixture(0);
      expect(await contract.balance()).to.equal(0);
    })

    it("Should set the balance of 10", async function () {
      const { contract } = await deployContractFixture(10);
      expect(await contract.balance()).to.equal(10);
    })
  })

  describe("Functionality", function () {
    it("Draw adds 1 or stays at 0 if balance is 0", async function () {
      const { contract } = await deployContractFixture(0);

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
      expect([1, 0]).to.contain(balance.toNumber());
    })

    it("Draw adds 1 or reduces by 1 if balance is 10", async function () {
      const { contract } = await deployContractFixture(10);

      const txn = await contract.draw();
      await txn.wait();

      const balance = await contract.balance();
      expect([9, 11]).to.contain(balance.toNumber());
    })
  })
})
