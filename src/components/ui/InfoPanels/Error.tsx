import {UserErrors} from "../../../types/types.ts";
import styles from "./style.module.css";


export default function FormError({error}: {error: string | undefined | null}) {
    return (
        error && (
            <div className={styles.infoPanelContainer}>
                <p className={styles.formError}>
                    {error}
                </p>
            </div>
        )
    );
}

export function FormErrorsList({errors}: { errors: UserErrors }) {
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