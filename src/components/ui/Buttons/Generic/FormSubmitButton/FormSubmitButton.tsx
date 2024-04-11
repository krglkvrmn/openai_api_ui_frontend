import React from "react";
import styles from "./style.module.css";

export function FormSubmitButton({children}: {children: React.ReactNode}) {
    return (
        <div className={styles.buttonContainer}>
            <button className={styles.genericButton} type="submit">{children}</button>
        </div>
    );
}