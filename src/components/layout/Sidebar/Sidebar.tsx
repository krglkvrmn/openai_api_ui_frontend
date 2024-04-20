import React from "react";
import styles from "./style.module.css";
import {CollapsableEdgeElement} from "../../ui/CollapsableEdgeElement/CollapsableEdgeElement.tsx";


export function Sidebar(
    {children, side, isExpanded = false}:
    {children?: React.ReactNode, side: "left" | "right" | "top" | "bottom", isExpanded?: boolean }) {
    return (
        <CollapsableEdgeElement isExpanded={isExpanded} side={side}>
            <div className={styles.sidebarContainer}>
                <div className={styles.sidebarContent}>
                    {children}
                </div>
            </div>
        </CollapsableEdgeElement>
    );
}