'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { BN } from '@coral-xyz/anchor'
import {
  getProvider,
  initialize,
  createPoll,
  registerCandidate,
  vote,
  fetchAllCandidates,
  fetchAllVoters,
} from '../app/services/blockchain.service'
import { PublicKey } from '@solana/web3.js'

export default function Page() {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [isInitialized, setIsInitialized] = useState(false)
  const [nextCount, setNextCount] = useState<BN>(new BN(0))
  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  useEffect(() => {
    const fetchCounter = async () => {
      if (!program) return
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('counter')],
        program.programId
      )
      const counter = await program.account.counter.fetch(counterPDA)
      setNextCount(counter.count.add(new BN(1)))
      setIsInitialized(counter.count.gte(new BN(0)))
      console.log(counter.count.add(new BN(1)).toString())
    }

    fetchCounter()
  }, [program])

  return (
    <div className='flex flex-col justify-center items-center space-y-4'>
      <button onClick={() => initialize(program!, publicKey!)}>
        Initialize
      </button>
      <button
        onClick={() =>
          createPoll(
            program!,
            publicKey!,
            nextCount,
            'Poll 2',
            Date.now(),
            Date.now() + 86400000
          )
        }
      >
        Create Poll
      </button>
      <button
        onClick={() =>
          registerCandidate(program!, publicKey!, 2, 'Candidate 2')
        }
      >
        Register Candidate
      </button>
      <button onClick={() => vote(program!, publicKey!, 2, 1)}>Vote</button>
    </div>
  )
}
