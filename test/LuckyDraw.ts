import { expect } from "chai";
import { ethers } from "hardhat";
import { CustomError } from "hardhat/internal/hardhat-network/stack-traces/model";

type ContractError = {
  code: string;
  message: string;
  reason: string;
}

describe("LuckyDraw", function () {
  async function deployContractFixtureWith0Balance() {
    const factory = await ethers.getContractFactory("LuckyDraw");
    const contract = await factory.deploy(0);
    return { contract }
  }

  async function deployContractFixtureWith10Balance() {
    const factory = await ethers.getContractFactory("LuckyDraw");
    const contract = await factory.deploy(10);
    return { contract }
  }

  describe("Deployment", function () {
    it("Should have an address", async function () {
      const { contract } = await deployContractFixtureWith0Balance();
      expect(contract.address).to.not.be.equal("");
    })

    it("Should set the balance of 0", async function () {
      const { contract } = await deployContractFixtureWith0Balance();
      expect(await contract.balance()).to.equal(0);
    })

    it("Should set the balance of 10", async function () {
      const { contract } = await deployContractFixtureWith10Balance();
      expect(await contract.balance()).to.equal(10);
    })
  })

  describe("Functionality", function () {
    it("Draw adds 1 or stays at 0 if balance is 0", async function () {
      const { contract } = await deployContractFixtureWith0Balance();

      try {
        const txn = await contract.draw();
        await txn.wait();
      } catch (err) {
        const errorCode = (err as ContractError).code;
        if (errorCode !== "INSUFFICIENT_FUNDS") {
          throw err;
        }
      }

      const balance = await contract.balance();
      expect([1, 0]).to.contain(balance.toNumber());
    })

    it("Draw adds 1 or reduces by 1 if balance is 10", async function () {
      const { contract } = await deployContractFixtureWith10Balance();

      const txn = await contract.draw();
      await txn.wait();

      const balance = await contract.balance();
      expect([9, 11]).to.contain(balance.toNumber());
    })
  })
})
