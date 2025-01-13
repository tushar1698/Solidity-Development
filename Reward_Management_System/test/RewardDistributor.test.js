const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardDistributor", function () {
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

  describe("Test Suit", function () {
    // Check Owner
    it("Should set right owner", async () => {
      const owner = await RewardDistributorContract.owner();
      expect(owner).to.be.equal(deployer.address);
    });

    // Check withdraw function
    it("Should work withdraw function if caller is owner", async () => {
      //Withdraw 100 $fire token to user1 account.
      await RewardDistributorContract.connect(deployer).withdrawToken(
        fireContract.address,
        user1.address,
        100
      );
      const expectedTokenBalance = await fireContract.balanceOf(user1.address);
      expect(expectedTokenBalance).to.be.equal(100);
    });

    it("Should not work withdraw function if caller is badactor", async () => {
      await expect(
        RewardDistributorContract.connect(badActor).withdrawToken(
          fireContract.address,
          user1.address,
          100
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    // Check updateLastDistributionTime function
    it("Should work updateLastDistributionTime function if caller is owner", async () => {
      await RewardDistributorContract.connect(
        deployer
      ).updateLastDistributionTime();
      const lastDistributionTime =
        await RewardDistributorContract.lastDistributionTime();

      console.log("LastDistributionTime = ", lastDistributionTime);
    });

    // Check setTokensPerInterval function
    it("Should work setTokensPerInterval function if caller is owner", async () => {
      await RewardDistributorContract.connect(
        deployer
      ).updateLastDistributionTime();
      const tx = await RewardDistributorContract.connect(
        deployer
      ).setTokensPerInterval(999);
      const expectedTokenPerInterval =
        await RewardDistributorContract.tokensPerInterval();

      expect(expectedTokenPerInterval).to.be.equal(999);
      expect(tx)
        .to.emit("TokensPerIntervalChange", RewardDistributorContract)
        .withArgs("999");
    });

    it("Should not work setTokenPerInterval function if caller is badactor", async () => {
      await expect(
        RewardDistributorContract.connect(badActor).setTokensPerInterval(999)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    // Check pendingRewards function
    it("Should work pendingRewards function", async () => {
      await RewardDistributorContract.connect(
        deployer
      ).updateLastDistributionTime();
      await RewardDistributorContract.connect(deployer).setTokensPerInterval(
        999
      );
      const expectedValue = await RewardDistributorContract.connect(
        deployer
      ).pendingRewards();
      console.log("expectedValue = ", expectedValue);
    });
  });
});
