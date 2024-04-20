import React, {useMemo, useState} from "react";
import {ExpandCollapseButton} from "../Buttons/Icons/ExpandCollapseButton/ExpandCollapseButton.tsx";
import styles from "./style.module.css";

export function CollapsableEdgeElement(
    {children, side, isExpanded = false}:
    {children: React.ReactNode, side: "left" | "right" | "top" | "bottom", isExpanded?: boolean }
) {
    const [isHidden, setIsHidden] = useState<boolean>(!isExpanded);
    const className = useMemo(() => {
        switch (side) {
            case "left":
                return isHidden ? styles.collapsableEdgeElementLeftCollapsed : styles.collapsableEdgeElementLeftExpanded;
            case "right":
                return isHidden ? styles.collapsableEdgeElementRightCollapsed : styles.collapsableEdgeElementRightExpanded;
            case "top":
                return isHidden ? styles.collapsableEdgeElementTopCollapsed : styles.collapsableEdgeElementTopExpanded;
            case "bottom":
                return isHidden ? styles.collapsableEdgeElementBottomCollapsed : styles.collapsableEdgeElementBottomExpanded;
            default: throw new Error(`Invalid side: ${side}`);
        }

    }, [side, isHidden]);
    return (
        <aside className={className}>
            <div className={styles.expandCollapseButtonContainer}>
                <ExpandCollapseButton onClick={() => setIsHidden(prev => !prev)}
                                      isOpened={isExpanded}
                                      side={side}/>
            </div>
            <div className={styles.collapsableEdgeElementContent}>
                {children}
            </div>
        </aside>
    );
}