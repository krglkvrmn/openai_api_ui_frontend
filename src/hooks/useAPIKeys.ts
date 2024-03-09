import { useMutation, useQuery } from "react-query";
import {deleteAPIKeyRequest, getAPIKeysRequest, saveAPIKeyRequest} from "../services/backendAPI";
import { optimisticQueryUpdateConstructor } from "../utils/optimisticUpdates";
import {APIKeyRead} from "../types/dataTypes";
import {queryClient} from "../queryClient.ts";

type APIKeysStateType = APIKeyRead[] | undefined;

type TuseAPIKeysReturn = {
    apiKeys: APIKeysStateType,
    isLoading: boolean,
    isError: boolean,
    isSuccess: boolean,
    isEmpty: boolean,
    dispatchers: {
        deleteApiKey: (keyId: string) => Promise<unknown>,
        saveApiKey: (apiToken: string) => Promise<unknown>,
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

    const saveKeyMutation = useMutation({
        mutationFn: saveAPIKeyRequest,
        onSettled: async () => await queryClient.invalidateQueries(['apiKeys'], { exact: true })
    });

    return { 
        apiKeys: apiKeysQuery.data, 
        isLoading: apiKeysQuery.isLoading,
        isError: apiKeysQuery.isError,
        isSuccess: apiKeysQuery.isSuccess,
        isEmpty: apiKeysQuery.data !== undefined && apiKeysQuery.data.length === 0,
        dispatchers: {
            deleteApiKey: deleteKeyMutation.mutateAsync,
            saveApiKey: saveKeyMutation.mutateAsync
        }
    };
}