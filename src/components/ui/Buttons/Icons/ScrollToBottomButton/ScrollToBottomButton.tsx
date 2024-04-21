import React from "react";
import styles from "./style.module.css";
import {IconButton} from "../IconButton/IconButton.tsx";
import {MdOutlineArrowCircleDown} from "react-icons/md";
import {scrollToBottom} from "../../../../../utils/ui.ts";

export function ScrollToBottomButton({containerRef}: { containerRef: React.RefObject<HTMLElement> }) {
    return (
        <div className={styles.scrollToBottomButtonContainer}>
            <IconButton Icon={MdOutlineArrowCircleDown} onClick={() => scrollToBottom(containerRef)}/>
        </div>
    );
}