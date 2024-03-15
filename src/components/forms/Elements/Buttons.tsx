import React, {MouseEventHandler} from "react";
import styles from "./style.module.css";
import {Spinner} from "../../ui/Indicators/Spinner.tsx";

export function FormSubmitButton({children, replaceWithLoader = false}: { children: React.ReactNode, replaceWithLoader?: boolean }) {
    return (
        <div className={styles.buttonContainer}>
        {
            replaceWithLoader ?
                <Spinner /> :
                <button className={styles.formSubmitButton} type="submit">{children}</button>
        }
        </div>
    );
}

export function GuestLoginButton({onClick, replaceWithLoader = false}: { onClick: MouseEventHandler, replaceWithLoader?: boolean }) {
    return (
        <div className={styles.buttonContainer}>
        {
            replaceWithLoader ?
                <Spinner /> :
                <button className={styles.guestLoginButton} onClick={onClick}>Continue as guest</button>
        }
        </div>
    );
}