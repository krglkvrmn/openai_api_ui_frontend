import React from "react";
import styles from "./style.module.css";
import {CollapsableEdgeElement} from "../CollapsableEdgeElement/CollapsableEdgeElement.tsx";


export function Sidebar({children, side}: { children?: React.ReactNode, side: "left" | "right" | "top" | "bottom" }) {
    return (
        <CollapsableEdgeElement side={side}>
            <div className={styles.sidebarContainer}>
                <div className={styles.sidebarContent}>
                    {children}
                </div>
            </div>
        </CollapsableEdgeElement>
    );
}