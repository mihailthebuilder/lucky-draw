import { ethers } from "hardhat";

const main = async () => {
  const [deployer] = await ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("Account balance: ", accountBalance.toString());

  const factory = await ethers.getContractFactory("LuckyDraw");
  const contract = await factory.deploy(ethers.utils.parseEther("0.000001"), { value: ethers.utils.parseEther("0.0001") });
  await contract.deployed();

  console.log("LuckyDraw address: ", contract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
