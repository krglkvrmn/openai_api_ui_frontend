import {IconType} from "react-icons";
import React from "react";
import styles from "./style.module.css";

export function IconButton(
    {Icon, onClick}:
    { Icon: IconType, onClick?: React.MouseEventHandler}
) {
    return (
        <button className={styles.iconButton}
                onClick={onClick}>
            <Icon/>
        </button>
    );
}