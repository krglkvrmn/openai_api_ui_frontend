import {UserErrors} from "../../../../types/types.ts";
import styles from "./style.module.css";
import {ReloadButton} from "../../Buttons/Icons/ReloadButton/ReloadButton.tsx";
import React from "react";


export default function FormError({error}: {error: string | undefined | null}) {
    return (
        error && (
            <div className={styles.formErrorContainer}>
                <p className={styles.formError}>
                    {error}
                </p>
            </div>
        )
    );
}

export function ValidationErrorsList({errors}: { errors: UserErrors }) {
    return (
        errors.length !== 0 &&
            <ul className={styles.authFormValidationErrorsList}>
                {
                    errors.map((error, index) => {
                        return (
                            <li className={styles.authFormValidationErrorsListItem}>
                                <FormError key={index} error={error}/>
                            </li>
                        );
                    })
                }
            </ul>
    );
}

export function LoadingError({errorText, reloadAction}: {errorText: string, reloadAction: React.MouseEventHandler}) {
    return (
        <div className={styles.loadingErrorContainer}>
            <p>{errorText}</p>
            <ReloadButton onClick={reloadAction}/>
        </div>
    );
}