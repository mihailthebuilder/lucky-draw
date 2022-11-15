import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LuckyDraw", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLuckyDrawContractFixture() {
    const factory = await ethers.getContractFactory("LuckyDraw");
    const contract = await factory.deploy();
    return { contract }
  }

  describe("Deployment", function () {
    it("Should have an address", async function () {
      const { contract } = await loadFixture(deployLuckyDrawContractFixture);
      expect(contract.address).to.not.be.equal("");
    })

    it("Should set the right balance", async function () {
      const { contract } = await loadFixture(deployLuckyDrawContractFixture);
      expect(await contract.balance()).to.equal(0);
    })
  })

  describe("Functionality", function () {
    it("Call is either winner or loser", async function () {
      const { contract } = await loadFixture(deployLuckyDrawContractFixture);
      expect([true, false]).to.contain(await contract.isWinningCall());
    })
  })
})
