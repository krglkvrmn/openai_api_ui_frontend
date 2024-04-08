import {RefObject} from "react";
import {UserInfo} from "../UserInfo/UserInfo.tsx";
import {APIKeysController} from "../APIKeys/APIKeysController.tsx";
import styles from "./style.module.css";

export function AccountSettingsModal(
    {dialogRef, openDialog, closeDialog}:
        { dialogRef: RefObject<HTMLDialogElement>, openDialog?: () => void, closeDialog?: () => void }
) {
    return (
        <dialog ref={dialogRef} className={styles.accountSettingsModal}>
            <h2>Account information</h2>
            <UserInfo/>
            <h2>Your API keys</h2>
            <APIKeysController/>
            <div className={styles.accountSettingsModalFooter}>
                <button onClick={closeDialog}>Close</button>
            </div>
        </dialog>
    );
}