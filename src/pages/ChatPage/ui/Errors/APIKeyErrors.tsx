import FormError from "../../../../components/ui/InfoDisplay/Errors/Errors.tsx";
import {APIKeyErrorType} from "../../../../types/errorTypes.ts";
import {ReactElement} from "react";
import styles from "./style.module.css";

export function APIKeyErrors({apiKeysErrorType}: {apiKeysErrorType: APIKeyErrorType}) {
    let element: ReactElement
    switch (apiKeysErrorType) {
        case 'api_key_unset':
            element = <FormError error="You must set an API key in the field above to use a chat" />; break;
        case 'invalid_api_key':
            element = <>
                <FormError error="Your API key is invalid"/>
            </>; break;
        default:
            element = <FormError error="Unknown problem with an API key" />

    }
    return (
        <div className={styles.apiKeyErrorsContainer}>
            { apiKeysErrorType !== undefined && element }
        </div>
    );
}