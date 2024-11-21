'use client'

import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import idl from '../../anchor/target/idl/votee.json'
import { Votee } from '../../anchor/target/types/votee'
import { useCallback, useEffect, useMemo, useState } from 'react'

export default function Page() {
  const { publicKey, sendTransaction, signTransaction } = useWallet()

  const [hasFetched, setHasFetched] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [nextCount, setNextCount] = useState<BN>(new BN(0))
  const programId = useMemo(() => new PublicKey(idl.address), [])

  const getProvider = useCallback(() => {
    if (!publicKey || !signTransaction) {
      console.error('Wallet not connected or missing signTransaction.')
      return null
    }

    const connection = new Connection('https://api.devnet.solana.com')

    try {
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
        { commitment: 'processed' }
      )

      return new Program<Votee>(idl as any, provider)
    } catch (error) {
      console.error('Failed to create program:', error)
      return null
    }
  }, [publicKey, sendTransaction, signTransaction])

  const fetchAndIncrementCount = useCallback(async () => {
    if (hasFetched) return
    const program = getProvider()

    if (!program) {
      console.error('Unable to get provider.')
      return
    }

    try {
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('counter')],
        programId
      )

      const currentCountBN = await program.account.counter.fetch(counterPDA)
      const newCount = currentCountBN.count
      setNextCount(newCount.add(new BN(1)))

      const logMessage = `Next Counter ID ${newCount.add(new BN(1)).toString()}`

      console.log(logMessage)
      setIsInitialized(currentCountBN.count >= new BN(0))
      setHasFetched(true)
    } catch (error) {
      console.error('Failed to fetch or increment count:', error)
    }
  }, [getProvider, programId, hasFetched])

  useEffect(() => {
    fetchAndIncrementCount()
  }, [fetchAndIncrementCount])

  const initialize = async () => {
    const program = getProvider()

    if (!program) {
      console.error('Unable to get provider.')
      return
    }

    try {
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('counter')],
        programId
      )

      const [registerationsPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('registerations')],
        programId
      )

      const tx = await program.methods
        .initialize()
        .accountsPartial({
          user: publicKey ?? PublicKey.default,
          counter: counterPDA,
          registerations: registerationsPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log('Transaction successful:', tx)
    } catch (error) {
      console.error('Initialization failed:', error)
    }
  }

  const createPoll = async (
    description: string,
    start: number,
    end: number
  ) => {
    const program = getProvider()

    if (!program) {
      console.error('Unable to get provider.')
      return
    }

    try {
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

      const tx = await program.methods
        .createPoll(description, startBN, endBN)
        .accountsPartial({
          user: publicKey ?? PublicKey.default,
          counter: counterPDA,
          poll: pollPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log('Poll created successfully:', tx)
    } catch (error) {
      console.error('Poll creation failed:', error)
    }
  }

  return (
    <div
      className="flex flex-col justify-center
    items-center space-y-4"
    >
      <h4>Hello World</h4>

      <button onClick={initialize} disabled={!publicKey || isInitialized}>
        Initialize Program
      </button>

      <button
        onClick={() =>
          createPoll(
            `Test Poll ${nextCount}`,
            Date.now(),
            Date.now() + 86400000
          )
        }
        disabled={!isInitialized}
      >
        Create Poll
      </button>
    </div>
  )
}
