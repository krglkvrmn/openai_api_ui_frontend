import { APIKeyForm } from "../../forms/ApiKeyForm/APIKeyForm.tsx";
import { APIKeysList } from "./APIKeysList.tsx";
import { LocalAPIKeyProvider } from "../../../contexts/LocalAPIKeyProvider.tsx";
import { useAPIKeys } from "../../../hooks/useAPIKeys.ts";
import styles from "./style.module.css";
import {ElementOrLoader} from "../../ui/Buttons/ElementOrLoader.tsx";


export function APIKeysController() {
    const { apiKeys, isLoading, isError, isSuccess, isEmpty, dispatchers } = useAPIKeys();
    const { saveApiKey, deleteApiKey } = dispatchers;

    return (
        <div className={styles.apiKeysControllerContainer}>
            {
                isError ? "Error while loading API keys" :
                <ElementOrLoader isLoading={isLoading}>
                    {
                        isSuccess && apiKeys !== undefined ? (
                            isEmpty ?
                                <>
                                    <LocalAPIKeyProvider>
                                        <APIKeyForm keySaveHandler={saveApiKey} />
                                    </LocalAPIKeyProvider>
                                    <p>You don't have any saved API keys. Submit it to the field above to save it to your profile</p>
                                </> :
                                <APIKeysList apiKeys={apiKeys} keyDeleteHandler={deleteApiKey}/>
                        ) : null
                    }
                </ElementOrLoader>
            }
        </div>
    );
}