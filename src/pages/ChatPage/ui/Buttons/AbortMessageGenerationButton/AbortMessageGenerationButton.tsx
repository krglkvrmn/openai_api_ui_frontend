import React from "react";
import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {MdStop} from "react-icons/md";

export function AbortMessageGenerationButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.abortMessageGenerationButtonContainer} title="Abort message generation">
            <IconButton Icon={MdStop} onClick={onClick}/>
        </div>
    );
}