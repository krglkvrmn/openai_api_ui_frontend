import {MouseEventHandler} from "react";
import styles from "../style.module.css";

export function GuestLoginButton({onClick}: {onClick: MouseEventHandler}) {
    return (
        <div className={styles.buttonContainer}>
            <button className={styles.guestLoginButton} onClick={onClick}>Continue as guest</button>
        </div>
    );
}