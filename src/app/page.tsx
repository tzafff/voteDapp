'use client'

import React from 'react'
import Link from 'next/link'

export default function Page() {
  const isInitialized = true // Assume the system is initialized
  const publicKey = 'DummyPublicKey' // Placeholder public key
  const polls = [
    {
      publicKey: 'DummyPollKey1',
      description: 'Favorite Thing about Christmas',
      start: new Date('2024-11-24T01:02:00').getTime(),
      end: new Date('2024-11-28T02:03:00').getTime(),
      candidates: 2,
    },
    {
      publicKey: 'DummyPollKey2',
      description: 'Best Sport in the World',
      start: new Date('2024-12-01T00:00:00').getTime(),
      end: new Date('2024-12-05T23:59:59').getTime(),
      candidates: 5,
    },
    {
      publicKey: 'DummyPollKey2',
      description: 'Safest Country in the world',
      start: new Date('2024-12-22T00:00:00').getTime(),
      end: new Date('2024-12-25T23:59:59').getTime(),
      candidates: 3,
    },
  ] // Dummy list of polls

  return (
    <div className="flex flex-col items-center py-10">
      {isInitialized && polls.length > 0 && (
        <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold mb-8">
          List of Polls
        </h2>
      )}

      {isInitialized && polls.length < 1 && (
        <>
          <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold mb-8">
            List of Polls
          </h2>
          <p>We don&apos;t have any polls yet, be the first to create one.</p>
        </>
      )}

      {!isInitialized && publicKey && (
        <button
          onClick={() => alert('Dummy Initialize')}
          className="bg-gray-800 text-white rounded-full
          px-6 py-2 text-lg font-bold mb-8"
        >
          Initialize
        </button>
      )}

      {!publicKey && polls.length < 1 && (
        <>
          <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold mb-8">
            List of Polls
          </h2>
          <p>We don&apos;t have any polls yet, please connect wallet.</p>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-4/5">
        {polls.map((poll) => (
          <div
            key={poll.publicKey}
            className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {poll.description.length > 20
                ? poll.description.slice(0, 25) + '...'
                : poll.description}
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-semibold">Starts:</span>{' '}
                {new Date(poll.start).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Ends:</span>{' '}
                {new Date(poll.end).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Candidates:</span>{' '}
                {poll.candidates}
              </p>
            </div>

            <div className="w-full">
              <Link
                href={`/polls/${poll.publicKey}`}
                className="bg-black text-white font-bold py-2 px-4 rounded-lg
              hover:bg-gray-900 transition duration-200 w-full block text-center"
              >
                View Poll
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
