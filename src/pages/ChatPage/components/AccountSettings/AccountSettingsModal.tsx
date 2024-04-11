import {RefObject} from "react";
import styles from "./style.module.css";
import {AccountSettings} from "./AccountSettings/AccountSettings.tsx";

export function AccountSettingsModal(
    {dialogRef, openDialog, closeDialog}:
        { dialogRef: RefObject<HTMLDialogElement>, openDialog?: () => void, closeDialog?: () => void }
) {
    return (
        <dialog ref={dialogRef} className={styles.accountSettingsModal}>
            <AccountSettings />
            <div className={styles.accountSettingsModalFooter}>
                <button onClick={closeDialog}>Close</button>
            </div>
        </dialog>
    );
}