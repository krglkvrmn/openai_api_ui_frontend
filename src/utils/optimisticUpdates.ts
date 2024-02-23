import { queryClient } from "../App";


export function optimisticQueryUpdateConstructor<QS, SS, MD>(
    { queryKey, stateUpdate, sideEffectsUpdate, sideEffectsRecover }: {
        queryKey?: string | (string | number | null)[];
        stateUpdate?: (mutateData: MD, prevState: QS | undefined) => QS;
        sideEffectsUpdate?: (mutateData: MD) => SS;
        sideEffectsRecover?: (sideEffectsPrevState: SS | undefined) => void;

    }) {
    const updateQuery = queryKey !== undefined && stateUpdate !== undefined;
    return {
        onMutate: async (mutateData: MD): Promise<{ previousQueryState?: QS; sideEffectsPrevState?: SS; }> => {
            const sideEffectsPrevState = sideEffectsUpdate ? sideEffectsUpdate(mutateData) : undefined;
            let previousQueryState: QS | undefined = undefined;
            if (updateQuery) {
                await queryClient.cancelQueries(queryKey, { exact: true });
                previousQueryState = queryClient.getQueryData(queryKey, { exact: true }) as QS;
                queryClient.setQueryData(queryKey, (oldState: QS | undefined) => stateUpdate(mutateData, oldState));
            }
            return { previousQueryState, sideEffectsPrevState };
        },
        onError: async (error: unknown, mutateData: MD, context?: { previousQueryState?: QS; sideEffectsPrevState?: SS }) => {
            updateQuery && queryClient.setQueryData(queryKey, context?.previousQueryState);
            sideEffectsRecover && sideEffectsRecover(context?.sideEffectsPrevState);
        },
        onSettled: async () => {
            console.log('Invalidated', queryKey);
            updateQuery && await queryClient.invalidateQueries(queryKey);
        }
    };

}
