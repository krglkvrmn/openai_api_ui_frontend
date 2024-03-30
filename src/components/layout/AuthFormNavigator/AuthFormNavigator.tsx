import React from "react";
import styles from "./style.module.css";

export function AuthFormNavigator({children}: {children: React.ReactNode}) {
    const className = React.Children.count(children) <= 1 ?
        styles.authFormNavContainerSingleItem : styles.authFormNavContainerMultipleItems;
    return (
        <nav className={className}>
            {children}
        </nav>
    );
}