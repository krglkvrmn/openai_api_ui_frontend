import React from "react";
import {IconButton} from "../IconButton/IconButton.tsx";
import {FaRegTrashCan} from "react-icons/fa6";
import styles from "./style.module.css";

export function DeleteButton({onClick}: { onClick?: React.MouseEventHandler}) {
    return (
        <div className={styles.deleteButtonContainer}>
            <IconButton Icon={FaRegTrashCan} onClick={onClick}/>
        </div>
    );
}