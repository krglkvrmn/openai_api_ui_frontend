import { UseQueryResult, useMutation, useQuery } from "react-query";
import { APIKeyForm } from "../forms/APIKeyForm";
import { APIKeysList } from "./APIKeysList";
import { APIKeysBackendResponse, deleteAPIKeyRequest, getAPIKeysRequest } from "../../services/backend_api";
import { optimisticQueryUpdateConstructor } from "../../utils/optimisticUpdates";
import { APIKeyProvider } from "../../contexts/APIKeyProvider";


type TuseAPIKeysReturn = {
    apiKeysQuery: UseQueryResult<APIKeysBackendResponse[], unknown>,
    deleteApiKey: (keyId: string) => void 
}

type APIKeysStateType = APIKeysBackendResponse[] | undefined;

export function useAPIKeys(): TuseAPIKeysReturn {
    const apiKeysQuery = useQuery({
        queryKey: ['apiKeys'],
        queryFn: getAPIKeysRequest,
    });

    const deleteKeyOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['apiKeys'],
        stateUpdate: (keyId: string, prevKeys: APIKeysStateType) => {
            if (prevKeys !== undefined) {
                return prevKeys.filter((keyData) => keyData.id !== keyId);
            }
            throw new Error('State is not loaded yet');
        }
    });

    const deleteKeyMutation = useMutation({
        mutationFn: deleteAPIKeyRequest,
        onMutate: deleteKeyOptimisticConfig.onMutate,
        onError: deleteKeyOptimisticConfig.onError,
        onSettled: deleteKeyOptimisticConfig.onSettled
    });

    return { apiKeysQuery, deleteApiKey: deleteKeyMutation.mutate };
}

export function APIKeysController() {
    const { apiKeysQuery, deleteApiKey } = useAPIKeys();

    return (
        <div>
            {
                apiKeysQuery.isError ? "Error while loading API keys" :
                apiKeysQuery.isLoading ? "Loading API keys..." :
                apiKeysQuery.isSuccess && apiKeysQuery.data !== undefined ? (
                    apiKeysQuery.data.length === 0 ? <>
                        <APIKeyProvider><APIKeyForm /></APIKeyProvider>
                        <p>You don't have any saved API keys</p>
                    </> : <APIKeysList apiKeys={apiKeysQuery.data} keyDeleteHandler={deleteApiKey}/>
                ) : null
            }
        </div>
    );
}