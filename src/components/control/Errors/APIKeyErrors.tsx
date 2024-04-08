import FormError from "../../ui/InfoPanels/Error.tsx";
import {Link} from "react-router-dom";
import {APIKeyErrorType} from "../../../types/errorTypes.ts";
import {useLocalAPIKey} from "../../../hooks/contextHooks.ts";
import {ReactElement} from "react";
import styles from "./style.module.css";

export function APIKeyErrors({apiKeysErrorType}: {apiKeysErrorType: APIKeyErrorType}) {
    const localAPIKey = useLocalAPIKey()[0];
    let element: ReactElement
    switch (apiKeysErrorType) {
        case 'api_key_unset':
            element = <FormError error="You must set an API key in the field above to use a chat" />; break;
        case 'invalid_api_key':
            element = <>
                <FormError error="Your API key is invalid"/>
                {
                    localAPIKey.value === "" &&
                    <span>You can manage your API keys <Link to="/profile">here</Link></span>
                }
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