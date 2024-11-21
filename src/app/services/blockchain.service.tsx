import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import idl from '../../../anchor/target/idl/votee.json'
import { Votee } from '../../../anchor/target/types/votee'

const programId = new PublicKey(idl.address)
let tx: any

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<Votee> | null => {
  if (!publicKey || !signTransaction) {
    console.error('Wallet not connected or missing signTransaction.')
    return null
  }

  const connection = new Connection('https://api.devnet.solana.com')
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: 'processed' }
  )

  return new Program<Votee>(idl as any, provider)
}

export const initialize = async (
  program: Program<Votee>,
  publicKey: PublicKey
) => {
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('counter')],
    programId
  )
  const [registerationsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  tx = await program.methods
    .initialize()
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      registerations: registerationsPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  console.log('Tx', tx)
}

export const createPoll = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  nextCount: BN,
  description: string,
  start: number,
  end: number
) => {
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

  tx = await program.methods
    .createPoll(description, startBN, endBN)
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      poll: pollPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  console.log('Tx', tx)
}

export const registerCandidate = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  pollId: number,
  name: string
) => {
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

  tx = await program.methods
    .registerCandidate(PID, name)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      registerations: registerationsPda,
      candidate: candidatePda,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  console.log('Tx', tx)
}

export const vote = async (
  program: Program<Votee>,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
) => {
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

  tx = await program.methods
    .vote(PID, CID)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      candidate: candidatePda,
      voter: voterPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  console.log('Tx', tx)
}

export const fetchAllCandidates = async (
  program: Program<Votee>,
  pollId: number
) => {
  const PID = new BN(pollId)
  const [registerationsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('registerations')],
    programId
  )

  const registerations = await program.account.registerations.fetch(
    registerationsPda
  )
  const candidateAccounts = []

  for (let i = 1; i <= registerations.count.toNumber(); i++) {
    const [candidatePda] = PublicKey.findProgramAddressSync(
      [
        PID.toArrayLike(Buffer, 'le', 8),
        new BN(i).toArrayLike(Buffer, 'le', 8),
      ],
      programId
    )
    const candidate = await program.account.candidate.fetch(candidatePda)
    candidateAccounts.push(candidate)
  }

  return candidateAccounts
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
