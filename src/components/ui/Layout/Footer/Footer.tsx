import React from "react";
import styles from "./style.module.css";

export default function Footer({children}: {children: React.ReactNode}) {
    return (
        <div className={styles.footerContainer}>
            {children}
        </div>
    )
}