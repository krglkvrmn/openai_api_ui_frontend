import React from "react";
import {IconButton} from "./IconButton.tsx";
import {IoMdCheckmark} from "react-icons/io";
import styles from "./style.module.css";

export function ConfirmButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.confirmButtonContainer}>
            <IconButton Icon={IoMdCheckmark} mode="light" onClick={onClick}/>
        </div>
    );
}