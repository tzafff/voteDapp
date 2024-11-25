import React from 'react'
import { Candidate } from '../utils/interfaces'

interface Props {
  candidates: Candidate[]
}

const CandidateList = ({ candidates }: Props) => {
  const handleVote = (direction: 'up' | 'down', candidateId: number) => {
    // Implement vote logic here
    console.log(`Voting ${direction} for candidate with id: ${candidateId}`)
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
              Votes:
              <span className="font-semibold">{candidate.votes}</span>
              <button
                onClick={() => handleVote('up', candidate.cid)}
                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Up
              </button>
              <button
                onClick={() => handleVote('down', candidate.cid)}
                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Down
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CandidateList
