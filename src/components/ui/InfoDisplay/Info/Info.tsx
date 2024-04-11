import styles from "./style.module.css";


export function FormInfo({infoMessage}: {infoMessage: string | null | undefined}) {
    return (
        infoMessage && (
            <div className={styles.infoPanelContainer}>
                <p className={styles.formInfo}>
                    {infoMessage}
                </p>
            </div>
        )
    );
}