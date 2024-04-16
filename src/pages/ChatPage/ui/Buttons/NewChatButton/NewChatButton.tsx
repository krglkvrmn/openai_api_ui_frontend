import React from "react";
import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import styles from "./style.module.css";
import {IoMdAdd} from "react-icons/io";

export function NewChatButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.newChatButtonContainer} title="Create a new chat">
            <IconButton Icon={IoMdAdd} onClick={onClick}/>
        </div>
    );
}