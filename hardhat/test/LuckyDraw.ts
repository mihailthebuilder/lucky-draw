import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LuckyDraw", function () {

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLuckyDrawContractFixture() {
    const [owner] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("LuckyDraw");
    const contract = await factory.deploy();

    return { contract, owner }
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { contract, owner } = await loadFixture(deployLuckyDrawContractFixture);
      expect(await contract.owner()).to.equal(owner.address);
    })
  })
})
