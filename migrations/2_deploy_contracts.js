const TestERC20 = artifacts.require('TestERC20');
const CentToken = artifacts.require('CentToken');

module.exports = async (deployer, network, accounts) => {

    if (network == "development") {
        await deployer.deploy(TestERC20,1000);
        await deployer.deploy(CentToken, "Cent", "CENT", "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0", "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b");
    }
    else
    {
        await deployer.deploy(CentToken, "Cent", "CENT", "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0", "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b");
    }
}
