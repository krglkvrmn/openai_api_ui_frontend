import { APIKeyForm } from "../forms/APIKeyForm";
import { APIKeysList } from "./APIKeysList";
import { LocalAPIKeyProvider } from "../../contexts/LocalAPIKeyProvider.tsx";
import { useAPIKeys } from "../../hooks/useAPIKeys";


export function APIKeysController() {
    const { apiKeys, isLoading, isError, isSuccess, isEmpty, dispatchers } = useAPIKeys();
    const { saveApiKey, deleteApiKey } = dispatchers;

    return (
        <div>
            {
                isError ? "Error while loading API keys" :
                isLoading ? "Loading API keys..." :
                isSuccess && apiKeys !== undefined ? (
                    isEmpty ?
                        <>
                            <LocalAPIKeyProvider>
                                <APIKeyForm keySaveHandler={saveApiKey} />
                            </LocalAPIKeyProvider>
                            <p>You don't have any saved API keys</p>
                        </> :
                        <APIKeysList apiKeys={apiKeys} keyDeleteHandler={deleteApiKey}/>
                ) : null
            }
        </div>
    );
}