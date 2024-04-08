import styles from "./style.module.css";
import React from "react";
import {IconButton} from "./IconButton.tsx";
import {MdSend} from "react-icons/md";


export function PromptSubmitButton({onClick}: {onClick?: React.MouseEventHandler}) {
    return (
        <div className={styles.promptSubmitButtonContainer} title="Ask ChatGPT">
            <IconButton Icon={MdSend} mode="dark" onClick={onClick}/>
        </div>
);
}