<div align="center">
  <img alt="ReDoc logo" src="https://raw.githubusercontent.com/centfinance/Community/main/media-pack/logo.png" width="400px" />

  ### Cent.Dex_Core
 
</div>

# Cent token contract

This project is the implementation of the ERC20 Cent Token.

Where possible we have inherited from the audited OpenZepplin contracts but we have also added
additional features including an implementation of ERC2612.

ERC2612 enables the use of off-chain signatures to increase allowances using `permit`. Calls to `permit` don't need to be done by the `holder` and so this enables support for "gas-less" tokens, or the replacement of `approve` transactions by methods that call `permit` and `transferFrom` atomically.

This contract was written by Switch1983.

The implementation of ERC2612 was heavily influenced by the work of Georgios Konstantopoulos and Alberto Cuesta Cañada.

## How to Use

`CentToken` is an `ERC20` contract. To test, make sure that you have Ganache-cli and Truffle installed alone with NodeJS.

Switch to a suitable version of Node

```
nvm install 10.22.1
```

Install dependencies

```
npm install
```

Run tests

```
truffle test
```

The `utils/signatures.ts` file contains useful functions to compute the `DOMAIN_SEPARATOR`, `digest` and `signature` from typescript.

## Further manual testing

A good way to become familiar with the Cent token and to carry our realtime testing is from the Truffle console.

Start the Ganache network
```
ganache-cli -h 0.0.0.0 --deterministic --gasLimit 10000000
```

Test the Ganache client is running
```
curl http://127.0.0.1:8545 \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc": "2.0", "method": "web3_clientVersion"}'
```

You should see output similar to the following.
```
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xCfEB869F69431e42cdB54A4F4f105C19C080A601", "latest"],"id":1}' localhost:8545
```

With Ganache running we now deploy our contracts.

```
truffle migrate
```

Now start the Truffle console for interactive testing.
```
truffle console
```

The following are examples of commands you can issue to interact with the Cent contract. Be aware that the account used for minting or snapshotting must match what was set in the migration config file.
```
// To get a reference to CentToken
let instance = await CentToken.deployed()
instance

// Mint coins
let accounts = await web3.eth.getAccounts()
instance.mint(accounts[2], 100, {from: accounts[0]})

// Check balance
let balance = await instance.balanceOf(accounts[2])
balance.toNumber()

// burn tokens
// Only the account holding tokens can burn their own tokens
instance.burn(10, {from: accounts[2]})
balance = await instance.balanceOf(accounts[2])
balance.toNumber()

// Allowance testing
// Account 2 gives account 3 an allowance of 10 to spend meaning account 3 can spend up to 10 of account 2 balance
instance.increaseAllowance(accounts[3], 10, {from: accounts[2]})

// Account 3 now sends 5 from account 2's account to account 4
instance.transferFrom(accounts[2], accounts[4], 5, {from: accounts[3]})

// Burn one of that accounts allowed tokens as well
instance.burnFrom(accounts[2], 1, {from: accounts[3]})

balance = await instance.balanceOf(accounts[2])
balance.toNumber()

// Grant MINTER_ROLE test
// should fail
instance.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", accounts[5], {from: accounts[5]})
// should work
instance.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", accounts[5], {from: accounts[0]})

// Revoke a role
instance.revokeRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", accounts[5], {from: accounts[0]})

// Give role again and then renounce that role
instance.grantRole("0x5fdbd35e8da83ee755d5e62a539e5ed7f47126abede0b8b10f9ea43dc6eed07f", accounts[5], {from: accounts[0]})
instance.renounceRole("0x5fdbd35e8da83ee755d5e62a539e5ed7f47126abede0b8b10f9ea43dc6eed07f", accounts[5], {from: accounts[5]})

// Transfer some tokens
instance.transfer(accounts[4], 5, {from: accounts[2]})

// Snapshot tests
instance.totalSupply({from: accounts[1]})
instance.snapshot({from: accounts[1]})

instance.totalSupplyAt(1, {from: accounts[1]})
instance.mint(accounts[2], 250, {from: accounts[0]})
instance.totalSupply({from: accounts[1]})
instance.totalSupplyAt(1, {from: accounts[1]})

instance.balanceOfAt(accounts[2], 1, {from: accounts[1]})
```