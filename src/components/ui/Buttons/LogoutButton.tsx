import styles from "./style.module.css";
import {RxExit} from "react-icons/rx";
import React from "react";
import {IconButton} from "./IconButton.tsx";


export function LogoutButton({onClick}: {onClick?: React.MouseEventHandler}) {
    return (
        <div className={styles.logoutButtonContainer}>
            <IconButton Icon={RxExit} mode="light" onClick={onClick} />
        </div>
    );
}