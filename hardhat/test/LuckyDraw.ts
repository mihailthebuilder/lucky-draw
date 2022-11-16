import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LuckyDraw", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
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
      const { contract } = await loadFixture(deployContractFixtureWith0Balance);
      expect(contract.address).to.not.be.equal("");
    })

    it("Should set the balance of 0", async function () {
      const { contract } = await loadFixture(deployContractFixtureWith0Balance);
      expect(await contract.balance()).to.equal(0);
    })

    it("Should set the balance of 10", async function () {
      const { contract } = await loadFixture(deployContractFixtureWith10Balance);
      expect(await contract.balance()).to.equal(10);
    })
  })

  describe("Functionality", function () {
    it("Draw adds 1 or stays at 0 if balance is 0", async function () {
      const { contract } = await loadFixture(deployContractFixtureWith0Balance);

      const txn = await contract.draw();
      await txn.wait();

      const balance = await contract.balance();
      expect([1, 0]).to.contain(balance.toNumber());
    })
  })
})
