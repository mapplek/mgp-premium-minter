import { alchemyProvider } from 'wagmi/providers/alchemy'
import { goerli } from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import AuthWallet from 'components/auth_wallet'
import Head from 'next/head'


const { publicClient } = configureChains(
    [goerli],
    [
        alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_TESTNET_ALCHEMY_API_KEY }),
        infuraProvider({ apiKey: process.env.NEXT_PUBLIC_TESTNET_INFURA_API_KEY }),
    ],
)

const connector = new MetaMaskConnector({
    chains: [goerli]
})

const config = createConfig({
    autoConnect: false,
    connectors: [connector],
    publicClient,
})

export default function Home() {
    return (
        <>
            <Head>
                <title>Machinegun Girl's Pass PREMIUM</title>
                <link rel="icon" href="/favicon.ico" sizes="32x32" />
            </Head>
            
            <WagmiConfig config={config}>
                <AuthWallet />
            </WagmiConfig>
        </>
    )
}