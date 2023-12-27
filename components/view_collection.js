import styles from 'styles/view_collection.module.css'
import Image from 'next/image'

export default function ViewCollection() {
    return (
        <div className={styles.container_view_collection}>
            <div className={styles.collection_name}>
                <h2>Machinegun Girl's Pass [PREMIUM]</h2>
            </div>
            <div className={styles.block_chain}>
                <div>
                    <Image
                        src='/ethereum.png'
                        width='45'
                        height='45'
                        alt='icon_eth'
                    />
                </div>
                <div>
                    <h3>Ethereum</h3>
                </div>
            </div>
            <div className={styles.container_img}>
                <div className={styles.block_view_img}>
                    <div className={styles.img_frame} />
                    <div className={styles.img_area}>
                        <Image
                            className={styles.img_property}
                            src='/mgp_premium.png'
                            width='250'
                            height='250'
                            alt='nft_image'
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}