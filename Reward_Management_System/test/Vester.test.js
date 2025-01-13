const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vester", function () {
  let Vester,
    VesterContract,
    fire,
    fireContract,
    esFire,
    esFireContract,
    RewardTracker,
    RewardTrackerContract;

  beforeEach(async function () {
    [deployer, controller, badActor, user1, user2, user3, ...user] =
      await ethers.getSigners();

    // fire smart contract deployment
    fire = await ethers.getContractFactory("fire");
    fireContract = await fire.deploy();
    await fireContract.deployed();

    // esFire smart contract deployment
    esFire = await ethers.getContractFactory("esFire");
    esFireContract = await esFire.deploy();
    await esFireContract.deployed();

    // RewardTracker smart contract deployment
    RewardTracker = await ethers.getContractFactory("RewardTracker");
    RewardTrackerContract = await RewardTracker.deploy(
      fireContract.address,
      esFireContract.address
    );
    await RewardTrackerContract.deployed();

    // Vester smart contract deployment
    Vester = await ethers.getContractFactory("Vester");
    VesterContract = await Vester.deploy(
      2592000,
      20000,
      esFireContract.address,
      RewardTrackerContract.address,
      fireContract.address
    );
    await VesterContract.deployed();
  });

  // describe("Test Suite", function () {
  //     it("Should set the right owner", async function () {
  //         const owner = await VesterContract.owner();
  //         expect(owner).to.be.equal(deployer.address);
  //     });

  //     it("Should set the right token name and symbol", async () => {
  //         const name = await VesterContract.name();
  //         const symbol = await VesterContract.symbol();
  //         expect(name).to.be.equal("Fire");
  //         expect(symbol).to.be.equal("FIRE");
  //     })
  // })
});
