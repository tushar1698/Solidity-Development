const { expect } = require("chai");
const { ethers } = require("hardhat")

describe("Fire", function () {
    let Fire, FireContract;

    beforeEach(async function () {
        [deployer, controller, badActor, user1, user2, user3, ...user] = await ethers.getSigners();

        // Fire smart contract deployment
        Fire = await ethers.getContractFactory("Fire");
        FireContract = await Fire.deploy();
        await FireContract.deployed();
    });

    describe("Test Suite", function () {
        it("Should set the right owner", async function () {
            const owner = await FireContract.owner();
            expect(owner).to.be.equal(deployer.address);
        });

        it("Should set the right token name and symbol", async () => {
            const name = await FireContract.name();
            const symbol = await FireContract.symbol();
            expect(name).to.be.equal("Fire");
            expect(symbol).to.be.equal("FIRE");
        })

        it("setHandler: should fail if caller is not the owner", async () => {
            await expect(FireContract.connect(badActor).setHandler(user1.address, true)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("setHandler: should work if caller is the owner", async () => {
            await FireContract.connect(deployer).setHandler(user1.address, true);
            const expected = await FireContract.isHandler(user1.address);
            expect(expected).to.be.equal(true);
        })

        it("setMinter: should fail if caller is not the owner", async () => {
            await expect(FireContract.connect(badActor).setMinter(user1.address, 10000)).to.be.revertedWith("Ownable: caller is not the owner");
        })

        it("setMinter: should work if caller is the owner", async () => {
            await FireContract.connect(deployer).setMinter(user1.address, 10000);
            const expected = await FireContract.minter(user1.address);
            expect(expected).to.be.equal(10000);
        })

        it("mint: should work regarding the allowance", async () => {
            await FireContract.connect(deployer).setMinter(user1.address, 100000);
            await FireContract.connect(user1).mint(user1.address, 10000);
            const expectedBalance1 = await FireContract.balanceOf(user1.address);
            expect(expectedBalance1).to.be.equal(10000);
            await FireContract.connect(user1).mint(user1.address, 100002);
            const expectedBalance2 = await FireContract.balanceOf(user1.address);
            expect(expectedBalance2).to.be.equal(100000);
        })

        it("burn: should fail if caller is not handler", async () => {
            await expect(FireContract.connect(badActor).burn(user1.address, 100)).to.be.revertedWith("!auth");
        })

        it("burn: should work if caller is handler", async () => {
            await FireContract.connect(deployer).setHandler(user1.address, true);
            await FireContract.connect(deployer).setMinter(user1.address, 100000);
            await FireContract.connect(user1).mint(user1.address, 10000);
            await FireContract.connect(user1).burn(user1.address, 100);
            const expectedBalance = await FireContract.balanceOf(user1.address);
            expect(expectedBalance).to.be.equal(9900);
        })
    })
})
