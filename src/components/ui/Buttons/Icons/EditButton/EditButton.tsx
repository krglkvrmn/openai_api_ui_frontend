import React from "react";
import {IconButton} from "../IconButton/IconButton.tsx";
import {MdEdit} from "react-icons/md";
import styles from "./style.module.css";

export function EditButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.editButtonContainer}>
            <IconButton Icon={MdEdit} mode="light" onClick={onClick}/>
        </div>
    );
}