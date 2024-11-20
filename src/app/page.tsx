'use client'

import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import idl from '../../anchor/target/idl/votee.json'
import { useState } from 'react'

export default function Page() {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const connection = new Connection('https://api.devnet.solana.com')

  const [isInitialized, setIsInitialized] = useState(false)
  const programId = new PublicKey(
    '39iYECXn1q87xKCTdAGgbADtbcByTC4qdW8bkWH43evt'
  )

  const initialize = async () => {
    if (!publicKey || !signTransaction) {
      console.error('Wallet not connected or missing signTransaction.')
      return
    }

    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
      { commitment: 'processed' }
    )

    const program = new Program(idl as any, provider)

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
          user: publicKey,
          counter: counterPDA,
          registerations: registerationsPDA,
          systemProgram: PublicKey.default,
        })
        .rpc()

      console.log('Transaction successful:', tx)
    } catch (error) {
      console.error('Initialization failed:', error)
    }
  }

  return (
    <div>
      <h4>Hello World</h4>
      <button onClick={initialize} disabled={!publicKey || isInitialized}>
        Initialize Program
      </button>
      {isInitialized && <p>Program successfully initialized!</p>}
    </div>
  )
}
