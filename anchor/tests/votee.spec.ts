const anchor = require('@coral-xyz/anchor')
const { SystemProgram } = anchor.web3

describe('votee', () => {
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)
  const program = anchor.workspace.Votee

  it('Initializes and creates a poll', async () => {
    const user = provider.wallet

    // Derive the PDA for the counter account
    const [counterPda, counterBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from('counter')],
        program.programId
      )

    // Attempt to fetch the counter account, skip initialization if it exists
    let counter
    try {
      counter = await program.account.counter.fetch(counterPda)
      console.log(
        'Counter account already exists with count:',
        counter.count.toString()
      )
    } catch (err) {
      console.log('Counter account does not exist. Initializing...')
      await program.rpc.initialize({
        accounts: {
          user: user.publicKey,
          counter: counterPda,
          systemProgram: SystemProgram.programId,
        },
      })

      // Fetch the counter after initialization
      counter = await program.account.counter.fetch(counterPda)
      console.log('Counter initialized with count:', counter.count.toString())
    }

    // Increment count to predict the next poll ID for PDA
    // const nextPollId = counter.count.add(new anchor.BN(1)); // Counter value after increment
    const [pollPda, pollBump] = await anchor.web3.PublicKey.findProgramAddress(
      [counter.count.toArrayLike(Buffer, "le", 8)], // Seed based on the incremented count
      program.programId
    );

    const description = 'Test Poll'
    const start = new anchor.BN(Date.now() / 1000)
    const end = new anchor.BN(Date.now() / 1000 + 86400)

    // Call create_poll with the correct accounts
    await program.rpc.createPoll(description, start, end, {
      accounts: {
        user: user.publicKey,
        poll: pollPda,
        counter: counterPda,
        systemProgram: SystemProgram.programId,
      },
      signers: [],
    })

    // Verify that the poll was created with the correct data
    const poll = await program.account.poll.fetch(pollPda)
    console.log('Poll ID:', poll.id.toString())
    console.log('Poll description:', poll.description)
  })
})
