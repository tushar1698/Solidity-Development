const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("esFire", function () {
  let esFire, esFireContract;

  beforeEach(async function () {
    [deployer, controller, badActor, user1, user2, user3, ...user] =
      await ethers.getSigners();
    // esFire smart contract deployment
    esFire = await ethers.getContractFactory("esFire");
    esFireContract = await esFire.deploy();
    await esFireContract.deployed();
  });

  describe("Test Suite", function () {
    it("Should set the right owner", async function () {
      const owner = await esFireContract.owner();
      expect(owner).to.be.equal(deployer.address);
    });

    it("Should set the right token name and symbol", async () => {
      const name = await esFireContract.name();
      const symbol = await esFireContract.symbol();
      expect(name).to.be.equal("esFire");
      expect(symbol).to.be.equal("esFIRE");
    });

    it("setHandler: should fail if caller is not the owner", async () => {
      await expect(
        esFireContract.connect(badActor).setHandler(user1.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("setHandler: should work if caller is the owner", async () => {
      await esFireContract.connect(deployer).setHandler(user1.address, true);
      const expected = await esFireContract.isHandler(user1.address);
      expect(expected).to.be.equal(true);
    });

    it("setMinter: should fail if caller is not the owner", async () => {
      await expect(
        esFireContract.connect(badActor).setMinter(user1.address, 10000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("setMinter: should work if caller is the owner", async () => {
      await esFireContract.connect(deployer).setMinter(user1.address, 10000);
      const expected = await esFireContract.minter(user1.address);
      expect(expected).to.be.equal(10000);
    });

    it("mint: should work regarding the allowance", async () => {
      await esFireContract.connect(deployer).setMinter(user1.address, 100000);
      await esFireContract.connect(user1).mint(user1.address, 10000);
      const expectedBalance1 = await esFireContract.balanceOf(user1.address);
      expect(expectedBalance1).to.be.equal(10000);
      await esFireContract.connect(user1).mint(user1.address, 100002);
      const expectedBalance2 = await esFireContract.balanceOf(user1.address);
      expect(expectedBalance2).to.be.equal(100000);
    });

    it("burn: should fail if caller is not handler", async () => {
      await expect(
        esFireContract.connect(badActor).burn(user1.address, 100)
      ).to.be.revertedWith("!auth");
    });

    it("burn: should work if caller is handler", async () => {
      await esFireContract.connect(deployer).setHandler(user1.address, true);
      await esFireContract.connect(deployer).setMinter(user1.address, 100000);
      await esFireContract.connect(user1).mint(user1.address, 10000);
      await esFireContract.connect(user1).burn(user1.address, 100);
      const expectedBalance = await esFireContract.balanceOf(user1.address);
      expect(expectedBalance).to.be.equal(9900);
    });

    it("Should work InprivateTransferMode", async function () {
      await esFireContract.connect(deployer).setInPrivateTransferMode(true);
      const expectedMode = await esFireContract.inPrivateTransferMode();
      expect(expectedMode).to.be.equal(true);
    });
  });
});
