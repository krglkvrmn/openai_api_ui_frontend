import React from "react";
import {useDialog} from "../../../../hooks/useDialog.ts";
import {IconButton} from "../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import {MdAccountCircle, MdLogout, MdOutlineMoreHoriz} from "react-icons/md";
import styles from "./style.module.css";


function AccountSettingsButton({onClick}: {onClick: React.MouseEventHandler}) {
    return (
        <div className={styles.authActionButtonContainer}>
            <button className={styles.authActionButton} onClick={onClick}>
                <MdAccountCircle />
                <span>Account settings</span>
            </button>
        </div>
    );
}
function LogoutButton({onClick}: {onClick: React.MouseEventHandler}) {
    return (
        <div className={styles.authActionButtonContainer}>
            <button className={styles.authActionButton} onClick={onClick}>
                <MdLogout />
                <span>Log out</span>
            </button>
        </div>
    );
}

export function AuthActionsPopupTriggerButton(
    {onLogoutClick, onAccountSettingsClick}:
    { onLogoutClick?: React.MouseEventHandler, onAccountSettingsClick?: React.MouseEventHandler }
) {
    const {isOpened, dialogRef, openDialog, closeDialog} = useDialog("popup");

    function clickHandlerConstructor(clickHandler?: React.MouseEventHandler): React.MouseEventHandler {
        return (event) => {
            clickHandler && clickHandler(event);
            closeDialog();
        }
    }

    return (
        <div className={styles.authActionsPopupTriggerButtonContainer}>
            <IconButton Icon={MdOutlineMoreHoriz} onClick={isOpened ? closeDialog : openDialog}/>
            <dialog ref={dialogRef} className={styles.authActionsPopup}>
                <AccountSettingsButton onClick={clickHandlerConstructor(onAccountSettingsClick)} />
                <LogoutButton onClick={clickHandlerConstructor(onLogoutClick)} />
            </dialog>
        </div>
    );
}