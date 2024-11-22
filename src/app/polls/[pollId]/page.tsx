'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  getReadonlyProvider,
  fetchPollDetails,
  fetchAllCandidates,
} from '../../services/blockchain.service'
import { Candidate, Poll } from '@/app/utils/interfaces'
import { useParams } from 'next/navigation'

export default function PollDetails() {
  const { pollId } = useParams()

  const program = useMemo(() => getReadonlyProvider(), [])
  const [poll, setPoll] = useState<Poll | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])

  useEffect(() => {
    if (!program || !pollId) return

    // Fetch poll details
    const fetchDetails = async () => {
      const pollData = await fetchPollDetails(program, pollId as string)
      setPoll(pollData)

      const candidateData = await fetchAllCandidates(program, pollId as string)
      setCandidates(candidateData)
      console.log(candidateData)
    }

    fetchDetails()
  }, [program, pollId])

  if (!poll) {
    return (
      <div className="flex flex-col items-center py-10">
        <h2 className="text-gray-700 text-lg font-semibold">
          Loading poll details...
        </h2>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-10 space-y-6">
      <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold">
        Poll Details
      </h2>

      <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 w-4/5 md:w-3/5 space-y-4 text-center">
        <h3 className="text-xl font-bold text-gray-800">{poll.description}</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <span className="font-semibold">Starts:</span>{' '}
            {new Date(poll.start).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Ends:</span>{' '}
            {new Date(poll.end).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Candidates:</span> {poll.candidates}
          </p>
        </div>
      </div>

      <h3 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold">
        Candidates
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-4/5">
        {candidates.map((candidate) => (
          <div
            key={candidate.cid}
            className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-800">
              {candidate.name}
            </h4>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Votes:</span> {candidate.votes}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
