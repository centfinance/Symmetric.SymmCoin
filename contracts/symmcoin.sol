// contracts/CentToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Snapshot.sol";

contract SymmCoin is ERC20Snapshot, ERC20Burnable, AccessControl, Ownable {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");

    bytes32 public immutable PERMIT_TYPEHASH = keccak256("Permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)");
    bytes32 public immutable DOMAIN_SEPARATOR;

    string  public constant version  = "1";
    mapping (address => uint256) public nonces;

    constructor(string memory name_, string memory symbol_, address minting_account, address snapshot_account) public ERC20(name_, symbol_) {

        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name_)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );

        // Setup an admin for all roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Grant MINTER_ROLE role to a specified account
        _setupRole(MINTER_ROLE, minting_account);

        // Grant SNAPSHOT_ROLE role to a specified account
        _setupRole(SNAPSHOT_ROLE, snapshot_account);
    }

    function mint(address account, uint256 amount) public {
        require(hasRole(MINTER_ROLE, msg.sender));
        _mint(account, amount); 
    }

    function snapshot() public {
        require(hasRole(SNAPSHOT_ROLE, msg.sender));
        _snapshot();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Snapshot, ERC20) {
        ERC20Snapshot._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev See {IERC2612-permit}.
     *
     * In cases where the free option is not a concern, deadline can simply be
     * set to uint(-1), so it should be seen as an optional parameter
     */
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
        require(deadline >= block.timestamp, "Cent: expired deadline");

        bytes32 hashStruct = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                hashStruct
            )
        );

        address signer = ecrecover(hash, v, r, s);
        require(
            signer != address(0) && signer == owner,
            "Symm: invalid signature"
        );

        _approve(owner, spender, value);
    }
}
