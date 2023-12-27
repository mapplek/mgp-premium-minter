import styles from 'styles/operate_nfts.module.css'
import ContainerMint from 'components/container_mint'
import ContainerChangeName from 'components/container_change_name';
import { useState } from 'react'

export default function OperateNFTs(props) {
    const [menuMode, setMenuMode] = useState('mint');

    return (
        <div className={styles.container_operate_nfts}>
            <div className={styles.block_select_menu}>
                <div>
                    <button
                        className={styles.tab_mint}
                        onClick={() => {
                            setMenuMode('mint');
                        }}
                    >
                        ミント
                    </button>
                </div>
                <div>
                    <button
                        className={styles.tab_name_change}
                        onClick={() => {
                            setMenuMode('change_name');
                        }}
                    >
                        名前変更
                    </button>
                </div>
            </div>

            {menuMode == 'mint' &&
                <ContainerMint connectedAddress={props.connectedAddress} />
            }

            {menuMode == 'change_name' &&
                <ContainerChangeName connectedAddress={props.connectedAddress} />
            }
        </div>
    )
}