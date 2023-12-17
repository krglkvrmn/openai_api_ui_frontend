import { queryClient } from "../App";


export function optimisticQueryUpdateConstructor<QS, SS, MD>(
    { queryKey, stateUpdate, sideEffectsUpdate, sideEffectsRecover }: {
        queryKey: string | (string | number | null)[];
        stateUpdate: (mutateData: MD, prevState: QS | undefined) => QS;
        sideEffectsUpdate?: (mutateData: MD) => SS;
        sideEffectsRecover?: (sideEffectsPrevState: SS | undefined) => void;

    }) {
    return {
        onMutate: async (mutateData: MD): Promise<{ previousQueryState: QS; sideEffectsPrevState?: SS; }> => {
            await queryClient.cancelQueries(queryKey, { exact: true });
            const previousQueryState = queryClient.getQueryData(queryKey, { exact: true }) as QS;
            const sideEffectsPrevState = sideEffectsUpdate ? sideEffectsUpdate(mutateData) : undefined;
            queryClient.setQueryData(queryKey, (oldState: QS | undefined) => stateUpdate(mutateData, oldState));
            return { previousQueryState, sideEffectsPrevState };
        },
        onError: async (error: unknown, mutateData: MD, context?: { previousQueryState: QS; sideEffectsPrevState?: SS; }) => {
            queryClient.setQueryData(queryKey, context?.previousQueryState);
            sideEffectsRecover && sideEffectsRecover(context?.sideEffectsPrevState);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries(queryKey);
        }
    };

}
