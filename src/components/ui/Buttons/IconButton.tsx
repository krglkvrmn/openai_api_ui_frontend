import {IconType} from "react-icons";
import React from "react";
import styles from "./style.module.css";

export function IconButton(
    {Icon, onClick, mode = "light"}:
        { Icon: IconType, onClick?: React.MouseEventHandler, mode?: "light" | "dark" }
) {
    const buttonStyles = {
        filter: mode === "light" ? "invert(100%)" : "none"
    }
    return (
        <button className={styles.iconButton}
                style={buttonStyles}
                onClick={onClick}>
            <Icon/>
        </button>
    );
}