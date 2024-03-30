import React from "react";
import {IconButton} from "./IconButton.tsx";
import {CgAddR} from "react-icons/cg";
import styles from "./style.module.css";

export function AddButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.addButtonContainer}>
            <IconButton Icon={CgAddR} mode="light" onClick={onClick}/>
        </div>
    );
}