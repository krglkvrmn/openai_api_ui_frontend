import React from "react";
import {IconButton} from "../../../../../components/ui/Buttons/Icons/IconButton/IconButton.tsx";
import {MdSend} from "react-icons/md";
import styles from "./style.module.css";


export function PromptSubmitButton({onClick}: {onClick?: React.MouseEventHandler}) {
    return (
        <div className={styles.promptSubmitButtonContainer} title="Ask ChatGPT">
            <IconButton Icon={MdSend} mode="dark" onClick={onClick}/>
        </div>
);
}