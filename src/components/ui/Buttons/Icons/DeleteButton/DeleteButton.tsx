import React from "react";
import {IconButton} from "../IconButton/IconButton.tsx";
import {FaRegTrashCan} from "react-icons/fa6";
import styles from "./style.module.css";

export function DeleteButton({onClick, mode}: { onClick?: React.MouseEventHandler, mode: "dark" | "light" }) {
    return (
        <div className={styles.deleteButtonContainer}>
            <IconButton Icon={FaRegTrashCan} mode={mode} onClick={onClick}/>
        </div>
    );
}