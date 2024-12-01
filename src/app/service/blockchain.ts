import {Connection, PublicKey, SystemProgram, TransactionSignature} from "@solana/web3.js";
import {Votee} from "../../../anchor/target/types/votee";
import {AnchorProvider, BN, Program, Wallet} from "@coral-xyz/anchor";
import idl from '../../../anchor/target/idl/votee.json'
import {globalActions} from "../../../store/globalSlices";

let tx
const programId = new PublicKey(idl.address)
const { setCandidates, setPoll } = globalActions
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'

export const getProvider = (
    publicKey: PublicKey | null,
    signTransaction: any,
    sendTransaction: any
): Program<Votee> | null => {
    if (!publicKey || !signTransaction) {
        console.error('Wallet not connected or missing signTransaction.')
        return null
    }

    const connection = new Connection(RPC_URL)
    const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
        { commitment: 'processed' }
    )

    return new Program<Votee>(idl as any, provider)
}

export const getReadonlyProvider = (): Program<Votee> => {
    const connection = new Connection(RPC_URL, 'confirmed')

    // Use a dummy wallet for read-only operations
    const dummyWallet = {
        publicKey: PublicKey.default,
        signTransaction: async () => {
            throw new Error('Read-only provider cannot sign transactions.')
        },
        signAllTransactions: async () => {
            throw new Error('Read-only provider cannot sign transactions.')
        },
    }

    const provider = new AnchorProvider(connection, dummyWallet as any, {
        commitment: 'processed',
    })

    return new Program<Votee>(idl as any, provider)
}

export const getCounter = async (program: Program<Votee>): Promise<BN> => {
    try {
        const [counterPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('counter')],
            program.programId
        )

        const counter = await program.account.counter.fetch(counterPDA)

        if (!counter) {
            console.warn('No counter found, returning zero')
            return new BN(0)
        }

        return counter.count
    } catch (error) {
        console.error('Failed to retrieve counter:', error)
        return new BN(-1)
    }
}

export const initialize = async (
    program: Program<Votee>,
    publicKey: PublicKey
): Promise<TransactionSignature> => {
    const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('counter')],
        programId
    )
    const [registerationsPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('registerations')],
        programId
    )

    tx = await program.methods
        .initialize()
        .accountsPartial({
            user: publicKey,
            counter: counterPDA,
            registerations: registerationsPDA,
            systemProgram: SystemProgram.programId,
        })
        .rpc()

    const connection = new Connection(
        program.provider.connection.rpcEndpoint,
        'confirmed'
    )
    await connection.confirmTransaction(tx, 'finalized')

    return tx
}