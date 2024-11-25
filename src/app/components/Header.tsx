import Link from 'next/link'
import { useEffect, useState } from 'react'

const Header = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="p-4 border-b border-gray-300 mb-4">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex justify-start items-center space-x-8">
          <Link href="/">
            <h4 className="text-black text-2xl font-extrabold">Votee</h4>
          </Link>

          <div className="flex justify-start items-center space-x-2">
            <Link href={'/create'}>Create</Link>
          </div>
        </div>

        {isMounted && (
          <button
            style={{
              backgroundColor: '#F97316',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 'bold',
            }}
          >
            Connect Wallet
          </button>
        )}
      </nav>
    </header>
  )
}

export default Header
