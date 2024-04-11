import React from "react";
import {IconButton} from "../IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {IoReload} from "react-icons/io5";

export function ReloadButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.reloadButtonContainer} title="Retry">
            <IconButton Icon={IoReload} mode="dark" onClick={onClick}/>
        </div>
    );
}
