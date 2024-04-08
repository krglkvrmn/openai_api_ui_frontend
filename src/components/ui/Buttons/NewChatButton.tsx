import React from "react";
import {IconButton} from "./IconButton.tsx";
import styles from "./style.module.css";
import {IoMdAdd} from "react-icons/io";

export function NewChatButton({onClick}: { onClick?: React.MouseEventHandler }) {
    return (
        <div className={styles.newChatButtonContainer} title="Create a new chat">
            <IconButton Icon={IoMdAdd} mode="light" onClick={onClick}/>
        </div>
    );
}