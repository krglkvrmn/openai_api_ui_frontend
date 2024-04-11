import React from "react";
import styles from "./style.module.css";

export function ModalCard({children, showBorder = false}: {children: React.ReactNode, showBorder?: boolean}) {
    const cardStyle = showBorder ? styles.modalCardBase : styles.modalCardBorderless;
    return (
        <div className={styles.modalCardWrapper}>
            <div className={cardStyle}>
                {children}
            </div>
        </div>
    );
}