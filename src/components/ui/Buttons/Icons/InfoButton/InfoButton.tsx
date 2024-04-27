import styles from "./style.module.css";
import {IconButton} from "../IconButton/IconButton.tsx";
import React from "react";
import {MdInfoOutline} from "react-icons/md";

export function InfoButton({onClick}: {onClick?: React.MouseEventHandler}) {
    return (
        <div className={styles.infoButtonContainer}>
            <IconButton Icon={MdInfoOutline} onClick={onClick}/>
        </div>
    );
}