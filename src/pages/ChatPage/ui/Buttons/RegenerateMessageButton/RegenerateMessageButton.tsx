import React from "react";
import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {MdOutlineReplay} from "react-icons/md";

export function RegenerateMessageButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.regenerateMessageButtonContainer}
             data-tooltip="Retry recieving a new message" data-tooltip-direction="top">
            <IconButton Icon={MdOutlineReplay} onClick={onClick}/>
        </div>
    );
}