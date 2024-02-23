import { useMutation, useQuery } from "react-query";
import { APIKeysBackendResponse, deleteAPIKeyRequest, getAPIKeysRequest } from "../services/backend_api";
import { optimisticQueryUpdateConstructor } from "../utils/optimisticUpdates";

type APIKeysStateType = APIKeysBackendResponse[] | undefined;

type TuseAPIKeysReturn = {
    apiKeys: APIKeysStateType,
    isLoading: boolean,
    isError: boolean,
    isSuccess: boolean,
    isEmpty: boolean,
    dispatchers: {
        deleteApiKey: (keyId: string) => void 
    }
}


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

    return { 
        apiKeys: apiKeysQuery.data, 
        isLoading: apiKeysQuery.isLoading,
        isError: apiKeysQuery.isError,
        isSuccess: apiKeysQuery.isSuccess,
        isEmpty: apiKeysQuery.data !== undefined && apiKeysQuery.data.length === 0,
        dispatchers: {
            deleteApiKey: deleteKeyMutation.mutate
        }
    };
}