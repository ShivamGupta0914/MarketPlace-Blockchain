const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("MarketPlace Assignment", function () {

    async function deployTokenFixture() {
        const [deployer, user1, user2, user3] = await ethers.getSigners();
        const token = await ethers.getContractFactory("TokenImplement");
        const Token = await token.connect(user3).deploy("Shiva Token", "SHIVA");
        await Token.deployed();
        const ERC721Contract = await ethers.getContractFactory("ERC721Token");
        const ERC721 = await ERC721Contract.connect(user3).deploy();
        await ERC721.deployed();
        const ERC1155Contract = await ethers.getContractFactory("ERC1155Token");
        const ERC1155 = await ERC1155Contract.connect(user3).deploy();
        await ERC1155.deployed();
        const marketPlaceContract = await ethers.getContractFactory("MarketPlace");
        const MarketPlace = await marketPlaceContract.connect(user2).deploy();
        await MarketPlace.deployed();
        return {Token, ERC721, ERC1155, MarketPlace, deployer, user1, user2, user3};
    }

    const zero_address = "0x0000000000000000000000000000000000000000";

    it("sellERC721 should work properly", async function () {
        const {MarketPlace, Token, ERC721, deployer, user1} = await loadFixture(deployTokenFixture);
        await expect(MarketPlace.connect(deployer).sellERC721(zero_address, 0, 100, Token.address)).to.be.revertedWith("tokenAddres you provided can not be zero");
        await ERC721.connect(deployer).mint(deployer.address, 0);
        await ERC721.mint(user1.address, 1);
        await expect(MarketPlace.connect(deployer).sellERC721(ERC721.address, 1, 100, Token.address)).to.be.revertedWith("you do not own this token id");
        await expect(MarketPlace.connect(deployer).sellERC721(ERC721.address, 0, 100, Token.address)).to.be.revertedWith("please approve the contract");
        await ERC721.connect(deployer).approve(MarketPlace.address, 0);
        expect(await MarketPlace.connect(deployer).sellERC721(ERC721.address, 0, 100, Token.address)).to.emit(MarketPlace, "SellToken").withArgs(deployer.address, 0, ERC721.address, 1);
    });

    it("sellERC1155 should work properly", async function () {
        const {MarketPlace, Token, ERC1155, deployer, user1} = await loadFixture(deployTokenFixture);
        await expect(MarketPlace.connect(deployer).sellERC1155(zero_address, 0, 100, 0, Token.address)).to.be.revertedWith("tokenAddres you provided can not be zero");
        await ERC1155.connect(deployer).mint(deployer.address, 0, 10);
        await expect(MarketPlace.connect(deployer).sellERC1155(ERC1155.address, 0, 100, 0, Token.address)).to.be.revertedWith("please enter number of tokens greater than 0");
        await ERC1155.mint(user1.address, 1, 20);
        await expect(MarketPlace.connect(deployer).sellERC1155(ERC1155.address, 1, 100, 20, Token.address)).to.be.revertedWith("you do not own sufficient number of token id");
        await expect(MarketPlace.connect(deployer).sellERC1155(ERC1155.address, 0, 100, 10, Token.address)).to.be.revertedWith("please approve the contract");
        await ERC1155.connect(deployer).setApprovalForAll(MarketPlace.address, true);
        expect(await MarketPlace.connect(deployer).sellERC1155(ERC1155.address, 0, 100, 10, Token.address)).to.emit(MarketPlace, "SellToken").withArgs(deployer.address, 0, ERC1155.address, 1);
    });

    it("buyERC721 function should work properly", async function () {
        const {MarketPlace, Token, ERC721, deployer, user1, user2, user3} = await loadFixture(deployTokenFixture);
        await ERC721.connect(user1).mint(user1.address, 0);
        await ERC721.connect(user1).approve(MarketPlace.address, 0);
        await MarketPlace.connect(user1).sellERC721(ERC721.address, 0, 10000, Token.address);
        await expect(MarketPlace.connect(deployer).buyERC721(2, Token.address)).to.be.revertedWith("token id is not on sale");
        await Token.mint(deployer.address,10000);
        await Token.connect(deployer).approve(MarketPlace.address, 10000);
        expect(await MarketPlace.connect(deployer).buyERC721(0, ERC721.address));
        expect(await Token.balanceOf(MarketPlace.address)).to.equal(55);

    });

    it("buyERC721 function should work properly with respect to Ethers", async function () {
        const {MarketPlace, Token, ERC721, deployer, user1, user2, user3} = await loadFixture(deployTokenFixture);
        await ERC721.connect(user1).mint(user1.address, 0);
        await ERC721.connect(user1).approve(MarketPlace.address, 0);
        await MarketPlace.connect(user1).sellERC721(ERC721.address, 0, 10000, zero_address);
        await expect(MarketPlace.connect(deployer).buyERC721(2, Token.address)).to.be.revertedWith("token id is not on sale");
        expect(await MarketPlace.connect(deployer).buyERC721(0, ERC721.address, {value : 10000}));
        expect(await ethers.provider.getBalance(MarketPlace.address)).to.equal(55);
    });

    it("buyERC1155 function should work properly", async function () {
        const {MarketPlace, Token, ERC1155, deployer, user1, user2, user3} = await loadFixture(deployTokenFixture);
        await ERC1155.connect(user1).mint(user1.address, 0, 100);
        await ERC1155.connect(user1).setApprovalForAll(MarketPlace.address, true);
        await MarketPlace.connect(user1).sellERC1155(ERC1155.address, 0, 10000, 50, Token.address);
        await expect(MarketPlace.connect(deployer).buyERC1155(2, 50, Token.address)).to.be.revertedWith("token id is not on sale");
        await Token.mint(deployer.address,1000000);
        await Token.connect(deployer).approve(MarketPlace.address, 1000000);
        await expect(MarketPlace.connect(deployer).buyERC1155(0,60, ERC1155.address)).to.be.revertedWith("less numner of tokens available for this token id");
        await MarketPlace.connect(deployer).buyERC1155(0, 50, ERC1155.address);
        expect(await Token.balanceOf(MarketPlace.address)).to.equal(2750);
    });

    it("buyERC1155 with ether should work properly", async function () {
        const {MarketPlace, Token, ERC1155, deployer, user1, user2, user3} = await loadFixture(deployTokenFixture);
        await ERC1155.connect(user1).mint(user1.address, 0, 100);
        await ERC1155.connect(user1).setApprovalForAll(MarketPlace.address, true);
        await MarketPlace.connect(user1).sellERC1155(ERC1155.address, 0, 10000, 50, zero_address);
        await expect(MarketPlace.connect(deployer).buyERC1155(2,10, Token.address)).to.be.revertedWith("token id is not on sale");
        expect(await MarketPlace.connect(deployer).buyERC1155(0,50, ERC1155.address, {value : 500000}));
        expect(await ethers.provider.getBalance(MarketPlace.address)).to.equal(2750);
    });

    it("should return token info", async function () {
        const {MarketPlace, Token, ERC1155, deployer, user1, user2, user3} = await loadFixture(deployTokenFixture);
        await ERC1155.connect(user1).mint(user1.address, 0, 100);
        await ERC1155.connect(user1).setApprovalForAll(MarketPlace.address, true);
        await MarketPlace.connect(user1).sellERC1155(ERC1155.address, 0, 10000, 50, zero_address);
        console.log(await MarketPlace.getTokenInfo(0, ERC1155.address));
    });

    it("withdraw commision should work properly", async function () {
        const {MarketPlace, Token, ERC1155, deployer, user1, user2, user3} = await loadFixture(deployTokenFixture);
        await expect(MarketPlace.connect(user3).withdrawCommision()).to.be.revertedWith("not authorized to withdraw");
        await MarketPlace.withdrawCommision();
    });

    // it("getNum1155Available should return ")
});