"use client"

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState } from 'react'

const Header = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="p-4 bg-white border-b border-gray-300 mb-4">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <h4 className="text-black text-2xl font-extrabold">Votee</h4>

        {isMounted && (
          <WalletMultiButton
            style={{ backgroundColor: '#F97316', color: 'white' }}
          />
        )}
      </nav>
    </header>
  )
}

export default Header
