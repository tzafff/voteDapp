import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Votee } from '../target/types/votee'
import IDL from '../target/idl/votee.json'
import { PublicKey } from '@solana/web3.js'

function generateRandomPollDetails() {
  const id = Math.floor(Date.now() / 10000)
  const description = `Poll description for ID ${id}: ${Math.random()
    .toString(36)
    .substring(7)}`
  const start =
    Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000) // Random future start time
  const end = start + Math.floor(Math.random() * 10000) + 3600 // Random end time, at least 1 hour after start
  return {
    id: new anchor.BN(id),
    description,
    start: new anchor.BN(start),
    end: new anchor.BN(end),
  }
}

describe('votee', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)

  // Initialize the program
  const program = new Program<Votee>(IDL as Votee, provider)

  it('Creating a Vote and Verifying Data', async () => {
    // Generating fake poll data
    const { id, description, start, end } = generateRandomPollDetails()

    // Derive the PDA for `poll` using the same method as in the Rust program
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [id.toArrayLike(Buffer, 'le', 8)], // Ensure same seed structure
      program.programId
    )

    // Call the createVote method on the program
    const tx = await (program.methods as any)
      .createVote(id, description, start, end)
      .accounts({
        user: provider.wallet.publicKey,
        poll: pollAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log('Transaction signature:', tx)

    // Fetch the poll account data
    const pollAccount = await program.account.poll.fetch(pollAddress)

    // Verify the poll data
    expect(pollAccount.id.toString()).toBe(id.toString())
    expect(pollAccount.description).toBe(description)
    expect(pollAccount.start.toString()).toBe(start.toString())
    expect(pollAccount.end.toString()).toBe(end.toString())
    expect(pollAccount.candidates.toNumber()).toBe(0) // Initial value should be 0

    console.log(pollAccount)
  })
})
