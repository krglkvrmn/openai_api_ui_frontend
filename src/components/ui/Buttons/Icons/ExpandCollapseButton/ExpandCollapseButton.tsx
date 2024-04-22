import React, {useState} from "react";
import {IconType} from "react-icons";
import {
    MdOutlineKeyboardArrowDown,
    MdOutlineKeyboardArrowLeft,
    MdOutlineKeyboardArrowRight,
    MdOutlineKeyboardArrowUp
} from "react-icons/md";
import styles from "./style.module.css";
import {IconButton} from "../IconButton/IconButton.tsx";

export function ExpandCollapseButton(
    {side, onClick, isOpened = false, autonomous = true}:
    { side: "left" | "right" | "top" | "bottom", onClick?: React.MouseEventHandler, isOpened?: boolean, autonomous?: boolean}
) {
    const [toggleState, setToggleState] = useState<boolean>(!isOpened);
    let CloseIcon: IconType;
    let OpenIcon: IconType;

    switch (side) {
        case "left":
            CloseIcon = MdOutlineKeyboardArrowLeft;
            OpenIcon = MdOutlineKeyboardArrowRight;
            break;
        case "right":
            CloseIcon = MdOutlineKeyboardArrowRight;
            OpenIcon = MdOutlineKeyboardArrowLeft;
            break;
        case "top":
            CloseIcon = MdOutlineKeyboardArrowUp;
            OpenIcon = MdOutlineKeyboardArrowDown;
            break;
        case "bottom":
            CloseIcon = MdOutlineKeyboardArrowDown;
            OpenIcon = MdOutlineKeyboardArrowUp;
            break;
        default:
            throw new Error(`Unknown side: ${side}`)

    }

    function clickHandler(event: React.MouseEvent) {
        setToggleState(prev => !prev);
        onClick && onClick(event);

    }

    return (
        <div className={styles.expandCollapseButtonContainer}>
            {
                (autonomous && !isOpened) || (!autonomous && toggleState) ?
                    <IconButton Icon={OpenIcon} onClick={clickHandler}/> :
                    <IconButton Icon={CloseIcon} onClick={clickHandler}/>
            }
        </div>
    );
}