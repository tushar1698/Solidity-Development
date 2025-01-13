const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardTracker", function () {
  let fire,
    fireContract,
    esFire,
    esFireContract,
    RewardTracker,
    RewardTrackerContract,
    RewardDistributor,
    RewardDistributorContract;

  beforeEach(async function () {
    [deployer, controller, badActor, user1, user2, user3, ...user] =
      await ethers.getSigners();

    // fire smart contract deployment
    fire = await ethers.getContractFactory("Fire");
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

    // RewardDistributor smart contract deployment
    RewardDistributor = await ethers.getContractFactory("RewardDistributor");
    RewardDistributorContract = await RewardDistributor.deploy(
      esFireContract.address,
      RewardTrackerContract.address,
      11574074
    );
    await RewardDistributorContract.deployed();

    // Mint tokens - user1 mint 1000 $fire and 10000 $esFire tokens into RewardDistributorContract
    await fireContract.connect(deployer).setMinter(user1.address, 1000);
    await fireContract
      .connect(user1)
      .mint(RewardDistributorContract.address, 1000);
    const expectedBalance1 = await fireContract.balanceOf(
      RewardDistributorContract.address
    );
    expect(expectedBalance1).to.be.equal(1000);

    await esFireContract.connect(deployer).setMinter(user1.address, 100000);
    await esFireContract
      .connect(user1)
      .mint(RewardDistributorContract.address, 10000);
    const expectedBalance2 = await esFireContract.balanceOf(
      RewardDistributorContract.address
    );
    expect(expectedBalance2).to.be.equal(10000);
  });

  describe("Test Suite", function () {
    // Check owner
    it("Should set the right owner", async function () {
      const owner = await RewardTrackerContract.owner();
      expect(owner).to.be.equal(deployer.address);
    });

    // Check name and symbol
    it("Should set the right token name and symbol", async () => {
      const name = await RewardTrackerContract.name();
      const symbol = await RewardTrackerContract.symbol();
      expect(name).to.be.equal("Staked FIRE");
      expect(symbol).to.be.equal("sFIRE");
    });

    // Check recoverToken function
    it("Should work recoverToken function - if owner calls", async () => {
      await fireContract.connect(deployer).setMinter(user1.address, 1000);
      await fireContract
        .connect(user1)
        .mint(RewardTrackerContract.address, 1000);
      const expectedBalance1 = await fireContract.balanceOf(
        RewardTrackerContract.address
      );
      expect(expectedBalance1).to.be.equal(1000);

      await esFireContract.connect(deployer).setMinter(user1.address, 100000);
      await esFireContract
        .connect(user1)
        .mint(RewardTrackerContract.address, 10000);
      const expectedBalance2 = await esFireContract.balanceOf(
        RewardTrackerContract.address
      );
      expect(expectedBalance2).to.be.equal(10000);

      await RewardTrackerContract.connect(deployer).recoverToken([
        fireContract.address,
        esFireContract.address,
      ]);
      const esFireTokenExpectedBalance = await esFireContract.balanceOf(
        deployer.address
      );
      const fireTokenExpectedBalance = await fireContract.balanceOf(
        deployer.address
      );
      expect(esFireTokenExpectedBalance).to.be.equal(10000);
      expect(fireTokenExpectedBalance).to.be.equal(1000);
    });

    it("Should not work recoverToken function - if baduser calls", async () => {
      await fireContract.connect(deployer).setMinter(user1.address, 1000);
      await fireContract
        .connect(user1)
        .mint(RewardTrackerContract.address, 1000);
      const expectedBalance1 = await fireContract.balanceOf(
        RewardTrackerContract.address
      );
      expect(expectedBalance1).to.be.equal(1000);

      await esFireContract.connect(deployer).setMinter(user1.address, 100000);
      await esFireContract
        .connect(user1)
        .mint(RewardTrackerContract.address, 10000);
      const expectedBalance2 = await esFireContract.balanceOf(
        RewardTrackerContract.address
      );
      expect(expectedBalance2).to.be.equal(10000);

      // expect(await RewardTrackerContract.connect(badActor).recoverToken([fireContract.address, esFireContract.address]));
      await expect(
        RewardTrackerContract.connect(badActor).recoverToken([
          fireContract.address,
          esFireContract.address,
        ])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    // Check setRewardDistributor function
    it("Should work setRewardDistributor function if caller is Owner", async () => {
      await RewardTrackerContract.connect(deployer).setRewardDistributor(
        RewardDistributorContract.address
      );

      const expectedDistributor = await RewardTrackerContract.distributor();
      expect(expectedDistributor).to.be.equal(
        RewardDistributorContract.address
      );
    });

    it("Should not work setRewardDistributor function if caller is badactor", async () => {
      await expect(
        RewardTrackerContract.connect(badActor).setRewardDistributor(
          RewardDistributorContract.address
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    //Check addExtraReward function
    it("Should work addExtraReward function if caller is Owner", async () => {
      await RewardTrackerContract.connect(deployer).addExtraReward(
        user1.address
      );
    });

    it("Should not work addExtraReward function if caller is badactor", async () => {
      await expect(
        RewardTrackerContract.connect(badActor).addExtraReward(user1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    //Check updateBoostParameters function
    it("Should work updateBoostParameters function if caller is Owner", async () => {
      await RewardTrackerContract.connect(deployer).updateBoostParameters(
        1,
        2,
        3
      );
      const expectedMaxBoost = await RewardTrackerContract.maxBoost();
      const expectedMaxBoostTime = await RewardTrackerContract.maxBoostTime();
      const expectedMinLockTime = await RewardTrackerContract.minLockTime();
      expect(expectedMaxBoost).to.be.equal(1);
      expect(expectedMaxBoostTime).to.be.equal(2);
      expect(expectedMinLockTime).to.be.equal(3);
    });

    it("Should not work updateBoostParameters function if caller is badactor", async () => {
      await expect(
        RewardTrackerContract.connect(badActor).updateBoostParameters(1, 2, 3)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    //Check claim function
    it("Should work claim function", async () => {});
  });
});
