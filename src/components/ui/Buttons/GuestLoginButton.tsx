import {MouseEventHandler} from "react";
import styles from "./style.module.css";
import {Spinner} from "../Indicators/Spinner.tsx";

export function GuestLoginButton({onClick, replaceWithLoader = false}: {
    onClick: MouseEventHandler,
    replaceWithLoader?: boolean
}) {
    return (
        <div className={styles.buttonContainer}>
            {
                replaceWithLoader ?
                    <Spinner/> :
                    <button className={styles.guestLoginButton} onClick={onClick}>Continue as guest</button>
            }
        </div>
    );
}