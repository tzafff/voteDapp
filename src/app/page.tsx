'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  fetchAllPolls,
  getProvider,
  initialize,
  registerCandidate,
  vote,
} from '../app/services/blockchain.service'

interface Poll {
  id: string
  description: string
  start: number // Unix timestamp
  end: number // Unix timestamp
  candidates: number
}

export default function Page() {
  const [polls, setPolls] = useState<Poll[]>([])
  const { publicKey, sendTransaction, signTransaction } = useWallet()

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  useEffect(() => {
    if (!program) return
    fetchAllPolls(program).then((data) => setPolls(data as any))
  }, [program])

  return (
    // <div className="flex flex-col justify-center items-center space-y-4">
    //   <button onClick={() => initialize(program!, publicKey!)}>
    //     Initialize
    //   </button>
    //   <button
    //     onClick={() =>
    //       registerCandidate(program!, publicKey!, 2, 'Candidate 2')
    //     }
    //   >
    //     Register Candidate
    //   </button>
    //   <button onClick={() => vote(program!, publicKey!, 2, 1)}>Vote</button>
    // </div>

    <div className="flex flex-col items-center py-10">
      <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold mb-8">
        List of Polls
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-4/5">
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {poll.description}
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-semibold">Start Date:</span>{' '}
                {new Date(poll.start).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">End Date:</span>{' '}
                {new Date(poll.end).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Candidates:</span>{' '}
                {poll.candidates}
              </p>
            </div>
            <button
              className="bg-black text-white font-bold py-2 px-4 rounded-lg
              hover:bg-gray-900 transition duration-200 w-full"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
