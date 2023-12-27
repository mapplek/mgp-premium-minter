import { createPortal } from 'react-dom'
import styles from 'styles/modal_confirmation.module.css'

export default function ModalConfirmation({
    children,
    confirmModalDisabled,
    confirmModalDisabledHandler,
    canCloseByClickingBackground = true
}) {
    const disabledHandler = () => {
        confirmModalDisabledHandler(true);
    }

    if(confirmModalDisabled) {
        return (
            <div></div>
        )
    }

    const elementModal = (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <button
                    type='button'
                    aria-label='モーダルを閉じる'
                    onClick={disabledHandler}
                    className={styles.btnClose}
                >
                    ×
                </button>
                {children}
            </div>
            {canCloseByClickingBackground && (
                <div className={styles.background} onClick={disabledHandler} />
            )}
        </div>
    )

    return createPortal(elementModal, document.body)
}