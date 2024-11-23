import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from '@solana/web3.js'
import idl from '../../../anchor/target/idl/votee.json'
import { Votee } from '../../../anchor/target/types/votee'
import { Candidate, Poll } from '../utils/interfaces'
import { store } from '../store'
import { globalActions } from '../store/globalSlices'

const programId = new PublicKey(idl.address)
const { setCandidates, setPoll } = globalActions
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<Votee> | null => {
  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected or missing signTransaction.')
    return null
  }

  const connection = new Connection(RPC_URL)
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: 'processed' }
  )

  return new Program<Votee>(idl as any, provider)
}

export const getReadonlyProvider = (): Program<Votee> => {
  const connection = new Connection(RPC_URL, 'processed')

  // Use a dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
    signAllTransactions: async () => {
      throw new Error('Read-only provider cannot sign transactions.')
    },
  }

  const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: 'processed',
  })

  return new Program<Votee>(idl as any, provider)
}

export const getCounter = async (program: Program<Votee>): Promise<BN> => {
  try {
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('counter')],
      program.programId
    )

    const counter = await program.account.counter.fetch(counterPDA)

    if (!counter) {
      console.warn('No counter found, returning zero')
      return new BN(0)
    }

    return counter.count
  } catch (error) {
    console.error('Failed to retrieve counter:', error)
    return new BN(-1)
  }
}

export const initialize = async (
  program: Program<Votee>,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )
  const [registerationsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  return await program.methods
    .initialize()
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      registerations: registerationsPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export const createPoll = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  nextCount: BN,
  description: string,
  start: number,
  end: number
): Promise<TransactionSignature> => {
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )
  const [pollPDA] = PublicKey.findProgramAddressSync(
    [nextCount.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  const startBN = new BN(start)
  const endBN = new BN(end)

  return await program.methods
    .createPoll(description, startBN, endBN)
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      poll: pollPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export const registerCandidate = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  pollId: number,
  name: string
): Promise<TransactionSignature> => {
  const PID = new BN(pollId)
  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8)],
    programId
  )
  const [registerationsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  const regs = await program.account.registerations.fetch(registerationsPda)
  const CID = regs.count.add(new BN(1))

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8), CID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  return await program.methods
    .registerCandidate(PID, name)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      registerations: registerationsPda,
      candidate: candidatePda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export const vote = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId)
  const CID = new BN(candidateId)

  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8)],
    programId
  )
  const [voterPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('voter'),
      PID.toArrayLike(Buffer, 'le', 8),
      publicKey.toBuffer(),
    ],
    programId
  )
  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, 'le', 8), CID.toArrayLike(Buffer, 'le', 8)],
    programId
  )

  return await program.methods
    .vote(PID, CID)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      candidate: candidatePda,
      voter: voterPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export const fetchAllPolls = async (
  program: Program<Votee>
): Promise<Poll[]> => {
  const polls = await program.account.poll.all()

  return polls.map(({ publicKey, account }) => ({
    ...account,
    id: publicKey.toBase58(),
    poll_id: account.id.toNumber(),
    start: account.start.toNumber(),
    end: account.end.toNumber(),
    candidates: account.candidates.toNumber(),
  }))
}

export const fetchPollDetails = async (
  program: Program<Votee>,
  pollAddress: string
): Promise<Poll> => {
  const poll = await program.account.poll.fetch(pollAddress)
  store.dispatch(setPoll(resturcturedPoll(poll, pollAddress)))
  return resturcturedPoll(poll, pollAddress)
}

const resturcturedPoll = (poll: any, pollAddress: string): Poll => {
  return {
    ...poll,
    id: pollAddress,
    poll_id: poll.id.toNumber(),
    start: poll.start.toNumber(),
    end: poll.end.toNumber(),
    candidates: poll.candidates.toNumber(),
  }
}

export const fetchAllCandidates = async (
  program: Program<Votee>,
  pollAddress: string
): Promise<Candidate[]> => {
  const pollData = await fetchPollDetails(program, pollAddress)
  if (!pollData) return []

  const PID = new BN(pollData.poll_id)
  const [registerationsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  const registerations = await program.account.registerations.fetch(
    registerationsPda
  )
  const candidateAccounts: Candidate[] = []

  if (pollData.candidates > 0) {
    for (let i = 1; i <= registerations.count.toNumber(); i++) {
      const [candidatePda] = PublicKey.findProgramAddressSync(
        [
          PID.toArrayLike(Buffer, 'le', 8),
          new BN(i).toArrayLike(Buffer, 'le', 8),
        ],
        programId
      )
      const candidate = await program.account.candidate.fetch(candidatePda)
      candidateAccounts.push(restructureCandidate(candidate))
    }
  }
  store.dispatch(setCandidates(candidateAccounts))
  return candidateAccounts
}

const restructureCandidate = (candidate: any): Candidate => {
  return {
    ...candidate,
    cid: candidate.cid.toNumber(),
    pollId: candidate.pollId.toNumber(),
    votes: candidate.votes.toNumber(),
  } as Candidate
}
export const fetchAllVoters = async (
  program: Program<Votee>,
  pollId: number
) => {
  const PID = new BN(pollId)
  const voterAccounts: any = []

  // Logic to fetch all voters for a given pollId
  // Note: Requires structure in your program for voters.

  return voterAccounts
}
