import styles from "./style.module.css";


export function Spinner() {
    return (
        <div className={styles.loaderContainer}>
            <div className={styles.loader}/>
        </div>
    );
}