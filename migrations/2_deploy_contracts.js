const TestERC20 = artifacts.require('TestERC20');
const SymmCoin = artifacts.require('SymmCoin');

module.exports = async (deployer, network, accounts) => {

    if (network == "development") {
        await deployer.deploy(TestERC20,1000);
        await deployer.deploy(SymmCoin, "Symmetric", "SYMM", "0x59e0A753Df69c54B2eEBe4E05c007345f0c61e85", "0x6e2d462488784D864BaeabcCee2aBaFd992a4BF0");
    }
    else
    {
        await deployer.deploy(SymmCoin, "Symmetric", "SYMM", "0x59e0A753Df69c54B2eEBe4E05c007345f0c61e85", "0x6e2d462488784D864BaeabcCee2aBaFd992a4BF0");
    }
}
