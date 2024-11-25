import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Candidate } from '../utils/interfaces'

interface Props {
  candidates: Candidate[]
  pollAddress: string
  pollId: number
}

const CandidateList = ({ candidates }: Props) => {
  const [voted, setVoted] = useState<boolean>(false)

  const handleVote = async (candidate: Candidate) => {
    if (voted) return

    await toast.promise(
      new Promise<void>((resolve, reject) => {
        try {
          console.log(
            `Voting for candidate: ${candidate.name} (ID: ${candidate.cid})`
          )
          // Simulate voting success
          setTimeout(() => {
            setVoted(true)
            resolve()
          }, 1000)
        } catch (error) {
          console.error('Voting failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approving vote...',
        success: 'Vote successful 👌',
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
                className={`px-2 py-1 bg-${voted ? 'red' : 'green'}-100 text-${
                  voted ? 'red' : 'green'
                }-700 ${!voted && 'hover:bg-green-200'} rounded`}
                disabled={voted}
              >
                {voted ? 'Voted' : 'Vote'}{' '}
                <span className="font-semibold">{candidate.votes}</span>
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CandidateList
