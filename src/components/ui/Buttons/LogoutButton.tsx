import styles from "./style.module.css";
import {RxExit} from "react-icons/rx";
import React from "react";


export function LogoutButton({onClick}: {onClick?: React.MouseEventHandler}) {
    return (
        <div className={styles.logoutButtonContainer}>
            <button className={styles.logoutButton}>
                 <RxExit className={styles.logoutButton} onClick={onClick} />
            </button>
        </div>
    );
}