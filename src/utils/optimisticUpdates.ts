import {QueryKey} from "react-query";
import {queryClient} from "../queryClient.ts";

type StateType<QS> = QS | undefined;
type StateUpdaterType<QS, MD> = (mutateData: MD, prevState: StateType<QS>) => QS;
type SideEffectsUpdaterType<MD, SS> = (mutateData: MD) => SS;
type SideEffectsRecoverType<SS> = (sideEffectsPrevState: StateType<SS>) => void;

type OptimisticQueryUpdateConstructorArgs<QS, SS, MD> = {
    queryKey?: QueryKey;
    stateUpdate?: StateUpdaterType<QS, MD>,
    sideEffectsUpdate?: SideEffectsUpdaterType<MD, SS>
    sideEffectsRecover?: SideEffectsRecoverType<SS>
}

type OnMutateReturn<QS, SS> = {previousQueryState: StateType<QS>, sideEffectsPrevState: StateType<SS>};
type OptimisticUpdateHandlers<QS, SS, MD> = {
    onMutate: (mutateData: MD) => Promise<OnMutateReturn<QS, SS>>,
    onError: (context?: OnMutateReturn<QS, SS>) => Promise<void>,
    onSettled: () => Promise<void>
}

export function optimisticQueryUpdateConstructor<QS, SS, MD>(
    { queryKey, stateUpdate, sideEffectsUpdate, sideEffectsRecover }: OptimisticQueryUpdateConstructorArgs<QS, SS, MD>
): OptimisticUpdateHandlers<QS, SS, MD> {
    const updateQuery = queryKey !== undefined && stateUpdate !== undefined;
    return {
        onMutate: async (mutateData: MD): Promise<OnMutateReturn<QS, SS>> => {
            const sideEffectsPrevState = sideEffectsUpdate ? sideEffectsUpdate(mutateData) : undefined;
            let previousQueryState: StateType<QS> = undefined;
            if (updateQuery) {
                await queryClient.cancelQueries(queryKey, { exact: true });
                previousQueryState = queryClient.getQueryData(queryKey, { exact: true }) as QS;
                queryClient.setQueryData(queryKey, (oldState: StateType<QS>) => stateUpdate(mutateData, oldState));
            }
            return { previousQueryState, sideEffectsPrevState };
        },
        onError: async (context?: OnMutateReturn<QS, SS>): Promise<void> => {
            updateQuery && queryClient.setQueryData(queryKey, context?.previousQueryState);
            sideEffectsRecover && sideEffectsRecover(context?.sideEffectsPrevState);
        },
        onSettled: async (): Promise<void> => {
            updateQuery && await queryClient.invalidateQueries(queryKey);
        }
    };

}
