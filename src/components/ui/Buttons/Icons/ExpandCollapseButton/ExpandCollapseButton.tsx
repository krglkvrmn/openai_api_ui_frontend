import React, {useState} from "react";
import {IconType} from "react-icons";
import {
    MdOutlineKeyboardArrowLeft,
    MdOutlineKeyboardArrowUp
} from "react-icons/md";
import styles from "./style.module.css";
import {IconButton} from "../IconButton/IconButton.tsx";

export function ExpandCollapseButton(
    {side, onClick, isOpened = false, autonomous = true}:
    { side: "left" | "right" | "top" | "bottom", onClick?: React.MouseEventHandler, isOpened?: boolean, autonomous?: boolean}
) {
    const [toggleState, setToggleState] = useState<boolean>(!isOpened);
    let Icon: IconType;

    switch (side) {
        case "left":
            Icon = MdOutlineKeyboardArrowLeft; break;
        case "right":
            Icon = MdOutlineKeyboardArrowLeft; break;
        case "top":
            Icon = MdOutlineKeyboardArrowUp; break;
        case "bottom":
            Icon = MdOutlineKeyboardArrowUp; break;
        default:
            throw new Error(`Unknown side: ${side}`)

    }

    function clickHandler(event: React.MouseEvent) {
        setToggleState(prev => !prev);
        onClick && onClick(event);

    }

    return (
        <div className={styles.expandCollapseButtonContainer}
             data-opened={(autonomous && isOpened) || (!autonomous && !toggleState)}
             data-side={side}>
            <IconButton Icon={Icon} onClick={clickHandler}/>
        </div>
    );
}