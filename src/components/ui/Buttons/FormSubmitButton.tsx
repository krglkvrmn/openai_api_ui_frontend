import React from "react";
import styles from "./style.module.css";
import {Spinner} from "../Indicators/Spinner.tsx";

export function FormSubmitButton({children, replaceWithLoader = false}: {
    children: React.ReactNode,
    replaceWithLoader?: boolean
}) {
    return (
        <div className={styles.buttonContainer}>
            {
                replaceWithLoader ?
                    <Spinner/> :
                    <button className={styles.formSubmitButton} type="submit">{children}</button>
            }
        </div>
    );
}