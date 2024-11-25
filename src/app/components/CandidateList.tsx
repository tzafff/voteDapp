import React, { useMemo } from 'react'
import { Candidate } from '../utils/interfaces'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  fetchAllCandidates,
  getProvider,
  vote,
} from '../services/blockchain.service'
import { toast } from 'react-toastify'

interface Props {
  candidates: Candidate[]
  pollAddress: string
}

const CandidateList = ({ candidates, pollAddress }: Props) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const handleVote = async (candidate: Candidate) => {
    if (!program || !publicKey) return

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await vote(
            program!,
            publicKey!,
            candidate.pollId,
            candidate.cid
          )

          await fetchAllCandidates(program, pollAddress)

          console.log(tx)
          resolve(tx as any)
        } catch (error) {
          console.error('Transaction failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 w-4/5 md:w-3/5 space-y-4 text-center">
      <div className="space-y-2">
        {candidates.map((candidate) => (
          <div
            key={candidate.publicKey}
            className="flex justify-between items-center border-b border-gray-300 last:border-none pb-4 last:pb-0"
          >
            <span className="text-gray-800 font-medium">{candidate.name}</span>
            <span className="text-gray-600 text-sm flex items-center space-x-2">
              <button
                onClick={() => handleVote(candidate)}
                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Vote <span className="font-semibold">{candidate.votes}</span>
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CandidateList
