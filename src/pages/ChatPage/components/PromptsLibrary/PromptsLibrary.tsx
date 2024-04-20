import {useMutation, useQuery, UseQueryResult} from "react-query";
import {funcClosureOrUndefined} from "../../../../utils/functional.ts";
import {
    deleteSystemPromptsRequest,
    getPopularSystemPromptsRequest,
} from "../../../../services/backendAPI.ts";
import {optimisticQueryUpdateConstructor} from "../../../../utils/optimisticUpdates.ts";
import {SystemPromptRead} from "../../../../types/dataTypes.ts";
import styles from "./style.module.css";
import {DeleteButton} from "../../../../components/ui/Buttons/Icons/DeleteButton/DeleteButton.tsx";
import {useSystemPrompt} from "../../../../hooks/contextHooks.ts";
import {ElementOrLoader} from "../../../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {LoadingError} from "../../../../components/ui/InfoDisplay/Errors/Errors.tsx";


type PromptLibraryRecordProps = {
    prompt: string,
    promptSelectionCallback?: () => void,
    promptDeleteHandler?: () => void
}

type TuseSystemPromptsLibrary = {
    systemPromptsLibraryQuery: UseQueryResult<SystemPromptRead[]>,
    deleteSystemPrompt: (promptId: number) => void
}

function useSystemPromptsLibrary(): TuseSystemPromptsLibrary {
    const systemPromptsLibraryQuery = useQuery({
        queryKey: ['prompts'],
        queryFn: getPopularSystemPromptsRequest
    });

    const systemPromptDeleteOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['prompts'],
        stateUpdate: (promptId: number, prevPrompts: SystemPromptRead[] | undefined) => {
            if (prevPrompts !== undefined) {
                return prevPrompts.filter(prompt => prompt.id !== promptId);
            }
            throw new Error('State is not loaded yet');
        }
    });

    const systemPromptDeleteMutation = useMutation({
        mutationFn: deleteSystemPromptsRequest,
        onMutate: systemPromptDeleteOptimisticConfig.onMutate,
        onError: systemPromptDeleteOptimisticConfig.onError,
        onSettled: systemPromptDeleteOptimisticConfig.onSettled
    });

    return { systemPromptsLibraryQuery, deleteSystemPrompt: systemPromptDeleteMutation.mutate };
}


export default function PromptsLibrary() {
    const setSystemPromptValue = useSystemPrompt()[1];
    const { systemPromptsLibraryQuery, deleteSystemPrompt } = useSystemPromptsLibrary();
    return (
        <div className={styles.promptLibraryContainer}>
            <h2 data-tooltip="This is a collection of most popular context prompts that you've sumbitted"
                data-tooltip-direction="bottom">Prompt library</h2>
            <hr />
            <ElementOrLoader isLoading={systemPromptsLibraryQuery.isLoading}>
                {
                    systemPromptsLibraryQuery.isError ? <LoadingError errorText="An error occurred while loading a prompt library"
                                                                      reloadAction={() => systemPromptsLibraryQuery.refetch()}/> :
                    systemPromptsLibraryQuery.isSuccess ? (
                        systemPromptsLibraryQuery.data.length > 0 ?
                            systemPromptsLibraryQuery.data.map((prompt) => {
                                return <PromptLibraryRecord key={prompt.id} prompt={prompt.content}
                                                            promptSelectionCallback={funcClosureOrUndefined(setSystemPromptValue, prompt.content)}
                                                            promptDeleteHandler={funcClosureOrUndefined(deleteSystemPrompt, prompt.id)}/>
                            }):
                            <p className={styles.noPromptsMessage}>You do not have any saved prompts yet</p>
                    ) : null
                }
            </ElementOrLoader>
        </div>
    );
}

function PromptLibraryRecord({prompt, promptSelectionCallback, promptDeleteHandler}: PromptLibraryRecordProps) {
    return (
        <div className={styles.promptLibraryRecordContainer}>
            <div className={styles.promptLibraryRecordTitleContainer} onClick={promptSelectionCallback}>
                <b className={styles.promptLibraryRecordTitle}>{prompt}</b>
            </div>
            <div className={styles.promptLibraryRecordControlsContainer}>
                <DeleteButton onClick={promptDeleteHandler} />
            </div>
        </div>
    );
}