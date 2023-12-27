import styles from 'styles/loading.module.css'

export default function Loading() {
    return (
        <div className={styles.loader}>
            <div className={styles.ball_clip_rotate_pulse}>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}