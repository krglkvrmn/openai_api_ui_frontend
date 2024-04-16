import {RefObject} from "react";
import styles from "./style.module.css";
import {AccountSettings} from "./AccountSettings/AccountSettings.tsx";
import {ModalCloseButton} from "../../../../components/ui/Buttons/Icons/ModalCloseButton/ModalCloseButton.tsx";

export function AccountSettingsModal(
    {dialogRef, openDialog, closeDialog}:
        { dialogRef: RefObject<HTMLDialogElement>, openDialog?: () => void, closeDialog?: () => void }
) {
    return (
        <dialog ref={dialogRef} className={styles.accountSettingsModal}>
            <div className={styles.accountSettingsModalHeader}>
                <h2>Account settings</h2>
                <ModalCloseButton onClick={closeDialog}/>
            </div>
            <hr />
            <AccountSettings/>
        </dialog>
    );
}