import React from "react";
import styles from "../style.module.css";

export function GenericButton(
    {children, onClick}:
    {
        children: React.ReactNode,
        onClick?: React.MouseEventHandler
    }
) {
    return (
        <div className={styles.buttonContainer}>
            <button onClick={onClick} className={styles.genericButton}>{children}</button>
        </div>
    );
}
