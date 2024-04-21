import React from "react";
import styles from "./style.module.css";

export function AuthFormNavigator({children}: {children: React.ReactNode}) {
    return (
        <nav className={styles.authFormNavContainer}>
            {children}
        </nav>
    );
}