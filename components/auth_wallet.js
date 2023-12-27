import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi'
import { Alert } from '@mui/material'
import styles from 'styles/auth_wallet.module.css'
import Loading from 'components/loading'
import OperateNFTs from 'components/operate_nfts'
import ViewCollection from 'components/view_collection'

export default function AuthWallet() {
    const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork();
    const { connector: isConnected, isConnecting, address } = useAccount();
    const { connect, connectors, error } = useConnect();
    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();

    return (
        <div className={styles.body}>
            <div className={styles.header}>
                {!isConnected && !isConnecting &&
                    <div className={styles.block_wallet}>
                        {connectors.map((connector) => (
                            <div key={connector.id}>
                                <button
                                    key={connector.id}
                                    onClick={() => connect({ connector })}
                                    className={styles.wallet_button}
                                >
                                    ウォレット接続
                                </button>
                            </div>
                        ))}
                    </div>
                }

                {error &&
                    <Alert
                        severity="error"
                    >
                        MetaMaskをインストールしてください
                    </Alert>
                }

                {isConnecting &&
                    <div>
                        <div>Is Connecting...</div>
                    </div>
                }

                {isConnected && (chain.id != process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID) &&
                    <div className={styles.block_wallet}>
                        <div>
                            <button
                                key={process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID}
                                onClick={() => switchNetwork?.(process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID)}
                                className={styles.wallet_button}
                            >
                                ネットワーク変更
                                {isLoading && pendingChainId === process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID &&
                                    ' (切替中...)'
                                }
                            </button>
                        </div>
                    </div>
                }

                {isConnected && (chain.id == process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID) &&
                    <div className={styles.block_wallet}>
                        <div>
                            <button
                                onClick={() => disconnect()}
                                className={styles.wallet_button}
                            >
                                ウォレット切断
                            </button>
                        </div>
                        <div className={styles.address_label}>
                            [ {address.substr(0, 5)}...{address.substr(-3, 3)} ]
                        </div>
                    </div>
                }
            </div>

            <ViewCollection />

            {isConnected && (chain.id == process.env.NEXT_PUBLIC_TESTNET_CHAIN_ID) &&
                <OperateNFTs connectedAddress={address} />
            }
        </div>
    )
}