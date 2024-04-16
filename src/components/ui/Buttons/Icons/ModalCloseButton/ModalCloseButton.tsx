import React from "react";
import styles from "./style.module.css";
import {IconButton} from "../IconButton/IconButton.tsx";
import {MdClose} from "react-icons/md";

export function ModalCloseButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.modalCloseButtonContainer}>
            <IconButton Icon={MdClose} onClick={onClick}/>
        </div>
    );
}
