import {Spinner} from "../Indicators/Spinner.tsx";
import React from "react";
import styles from "./style.module.css";

export function ElementOrLoader({isLoading, children}: {isLoading: boolean, children: React.ReactNode}) {
    return (
        <div className={styles.loadableElementContainer}>
            {
                isLoading ? <Spinner /> : children
            }
        </div>
    );
}