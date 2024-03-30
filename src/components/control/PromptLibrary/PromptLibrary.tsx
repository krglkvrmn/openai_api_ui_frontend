import {useMutation, useQuery, UseQueryResult} from "react-query";
import {funcClosureOrUndefined} from "../../../utils/functional.ts";
import {
    deleteSystemPromptsRequest,
    getPopularSystemPromptsRequest,
} from "../../../services/backendAPI.ts";
import {optimisticQueryUpdateConstructor} from "../../../utils/optimisticUpdates.ts";
import {SystemPromptRead} from "../../../types/dataTypes.ts";
import styles from "./style.module.css";
import {Spinner} from "../../ui/Indicators/Spinner.tsx";
import {DeleteButton} from "../../ui/Buttons/DeleteButton.tsx";
import {useSystemPrompt} from "../../../hooks/contextHooks.ts";


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


export default function PromptLibrary() {
    const setSystemPromptValue = useSystemPrompt()[1];
    const { systemPromptsLibraryQuery, deleteSystemPrompt } = useSystemPromptsLibrary();

    return (
        <div className={styles.promptLibraryContainer}>
            {
                systemPromptsLibraryQuery.isLoading ? <Spinner /> :
                systemPromptsLibraryQuery.isError ? "Error occurred while loading prompts" :
                systemPromptsLibraryQuery.isSuccess ? (
                    systemPromptsLibraryQuery.data.map((prompt) => {
                    return <PromptLibraryRecord key={prompt.id} prompt={prompt.content}
                                                 promptSelectionCallback={funcClosureOrUndefined(setSystemPromptValue, prompt.content)}
                                                 promptDeleteHandler={funcClosureOrUndefined(deleteSystemPrompt, prompt.id)}/>
                })) : null
            }
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