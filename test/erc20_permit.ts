const ERC20 = artifacts.require('TestERC20')

// @ts-ignore
import { expectRevert } from '@openzeppelin/test-helpers'
import { PERMIT_TYPEHASH, getPermitDigest, getDomainSeparator, sign } from '../utils/signatures'

type Contract = any

contract('CentTokenTest', async (accounts: string[]) => {
  // Ganache test account private key
  const ownerPrivateKey = Buffer.from('4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', 'hex')
  const chainId = 1

  let [owner, user] = accounts

  let token: Contract
  let name: string

  beforeEach(async () => {
    token = await ERC20.new(1000,{ from: owner })
    name = await token.name()
  })

  it('initializes DOMAIN_SEPARATOR and PERMIT_TYPEHASH correctly', async () => {
    assert.equal(await token.PERMIT_TYPEHASH(), PERMIT_TYPEHASH)
    assert.equal(await token.DOMAIN_SEPARATOR(), getDomainSeparator(name, token.address, chainId))
  })

  it('permits and emits Approval (replay safe)', async () => {
    // Create the approval request
    const approve = {
      owner: owner,
      spender: user,
      value: 100,
    }

    // deadline as much as you want in the future
    const deadline = 100000000000000

    // Get the user's nonce
   // const nonce = await token.nonces(owner)

    // Get the EIP712 digest
    const digest = getPermitDigest(name, token.address, chainId, approve, 0, deadline)

    // Sign it
    // NOTE: Using web3.eth.sign will hash the message internally again which
    // we do not want, so we're manually signing here
    const { v, r, s } = sign(digest, ownerPrivateKey)

    // Approve it
    const receipt = await token.permit(approve.owner, approve.spender, approve.value, deadline, v, r, s)
    const event = receipt.logs[0]

    // It worked!
    assert.equal(event.event, 'Approval')
    assert.equal(await token.nonces(owner), 1)
    assert.equal(await token.allowance(approve.owner, approve.spender), approve.value)

    // Re-using the same sig doesn't work since the nonce has been incremented
    // on the contract level for replay-protection
    await expectRevert(
      token.permit(approve.owner, approve.spender, approve.value, deadline, v, r, s),
      'Cent: invalid signature'
    )

    // invalid ecrecover's return address(0x0), so we must also guarantee that
    // this case fails
    await expectRevert(
      token.permit(
        '0x0000000000000000000000000000000000000000',
        approve.spender,
        approve.value,
        deadline,
        '0x99',
        r,
        s
      ),
      'Cent: invalid signature'
    )
  })
})
