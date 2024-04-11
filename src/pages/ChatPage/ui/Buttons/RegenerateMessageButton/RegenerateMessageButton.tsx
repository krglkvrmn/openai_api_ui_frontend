import React from "react";
import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {MdOutlineReplay} from "react-icons/md";

export function RegenerateMessageButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.regenerateMessageButtonContainer} title="Regenerate message">
            <IconButton Icon={MdOutlineReplay} mode="dark" onClick={onClick}/>
        </div>
    );
}