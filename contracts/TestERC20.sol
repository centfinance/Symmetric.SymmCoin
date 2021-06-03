// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./symmcoin.sol";

contract TestERC20 is SymmCoin {
    constructor (uint256 supply) public SymmCoin("Test", "TST", 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0, 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b) {
        _mint(msg.sender, supply);
    }
}
