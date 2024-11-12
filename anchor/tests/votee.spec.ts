const anchor = require('@coral-xyz/anchor')
const { SystemProgram, PublicKey } = anchor.web3

describe('votee', () => {
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)
  const program = anchor.workspace.Votee

  let PID: any

  it('Initializes and creates a poll', async () => {
    const user = provider.wallet

    // Derive the PDA for the counter account
    const [counterPda] = await PublicKey.findProgramAddress(
      [Buffer.from('counter')],
      program.programId
    )

    const [registerationsPda] = await PublicKey.findProgramAddress(
      [Buffer.from('registerations')],
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
          registerations: registerationsPda,
          systemProgram: SystemProgram.programId,
        },
      })

      // Fetch the counter after initialization
      counter = await program.account.counter.fetch(counterPda)
      console.log('Counter initialized with count:', counter.count.toString())
    }

    // Increment count to predict the next poll ID for PDA
    const pollId = counter.count.add(new anchor.BN(1)) // Counter value after increment
    const [pollPda] = await PublicKey.findProgramAddress(
      [pollId.toArrayLike(Buffer, 'le', 8)], // Seed based on the incremented count
      program.programId
    )

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
    console.log('Poll:', poll)

    PID = poll.id
  })

  it('Registers a candidate', async () => {
    const user = provider.wallet

    const [pollPda] = await PublicKey.findProgramAddress(
      [PID.toArrayLike(Buffer, 'le', 8)], // Seed based on the incremented count
      program.programId
    )

    const [registerationsPda] = await PublicKey.findProgramAddress(
      [Buffer.from('registerations')],
      program.programId
    )

    const regs = await program.account.registerations.fetch(registerationsPda)
    const cid = regs.count.add(new anchor.BN(1))

    const candidateName = 'Candidate1'
    const [candidatePda] = await PublicKey.findProgramAddress(
      [
        PID.toArrayLike(Buffer, 'le', 8), // Little-endian bytes of poll_id
        cid.toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    )

    await program.rpc.registerCandidate(PID, candidateName, {
      accounts: {
        poll: pollPda,
        candidate: candidatePda,
        registerations: registerationsPda,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      },
    })

    const candidate = await program.account.candidate.fetch(candidatePda)
    console.log('Candidate:', candidate)
  })

  // it('Votes for a candidate', async () => {
  //   const user = provider.wallet

  //   const candidates = await program.account.candidate.all()

  //   if (candidates.length === 0) {
  //     throw new Error('No candidates found')
  //   }

  //   // Get the latest candidate (last element of the array)
  //   const latestCandidate = candidates[candidates.length - 1]
  //   const { pollId, cid } = latestCandidate.account

  //   console.log(`Voting for Candidate: ${latestCandidate.account.name}`)
  //   console.log(
  //     `Poll ID: ${pollId.toString()}, Candidate ID: ${cid.toString()}`
  //   )

  //   // Derive the PDA for the poll
  //   const [pollPda] = await PublicKey.findProgramAddress(
  //     [pollId.toArrayLike(Buffer, 'le', 8)],
  //     program.programId
  //   )

  //   // Derive the PDA for the candidate
  //   const [candidatePda] = await PublicKey.findProgramAddress(
  //     [pollId.toArrayLike(Buffer, 'le', 8), cid.toArrayLike(Buffer, 'le', 8)],
  //     program.programId
  //   )

  //   // Derive the PDA for the voter account
  //   const [voterPda] = await PublicKey.findProgramAddress(
  //     [
  //       Buffer.from('voter'),
  //       pollId.toArrayLike(Buffer, 'le', 8),
  //       user.publicKey.toBuffer(),
  //     ],
  //     program.programId
  //   )

  //   // Perform the vote
  //   await program.rpc.vote(pollId, cid, {
  //     accounts: {
  //       user: user.publicKey,
  //       poll: pollPda,
  //       candidate: candidatePda,
  //       voter: voterPda,
  //       systemProgram: SystemProgram.programId,
  //     },
  //   })

  //   // Fetch and verify the updated candidate votes
  //   const updatedCandidate = await program.account.candidate.fetch(candidatePda)
  //   console.log(
  //     'Candidate Votes after voting:',
  //     updatedCandidate.votes.toString()
  //   )
  // })
})
