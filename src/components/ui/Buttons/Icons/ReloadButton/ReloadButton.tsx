import React from "react";
import {IconButton} from "../IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {IoReload} from "react-icons/io5";

export function ReloadButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.reloadButtonContainer}
             data-tooltip="Retry loading" data-tooltip-direction="bottom">
            <IconButton Icon={IoReload} onClick={onClick}/>
        </div>
    );
}
