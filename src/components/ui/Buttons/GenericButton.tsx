import React from "react";
import styles from "./style.module.css";
import {Spinner} from "../Indicators/Spinner.tsx";

export function GenericButton(
    {children, onClick, replaceWithLoader = false}:
    {
        children: React.ReactNode,
        onClick?: React.MouseEventHandler
        replaceWithLoader?: boolean
    }
) {
    return (
        <div className={styles.buttonContainer}>
            {
                replaceWithLoader ?
                    <Spinner/> :
                    <button onClick={onClick} className={styles.genericButton}>{children}</button>
            }
        </div>
    );
}
