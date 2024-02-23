import {useMutation, useQuery} from "react-query";
import {funcClosureOrUndefined} from "../../utils/functional";
import {
    deleteSystemPromptsRequest,
    getPopularSystemPromptsRequest,
    SystemPromptBackendResponse
} from "../../services/backend_api";
import {optimisticQueryUpdateConstructor} from "../../utils/optimisticUpdates";

type PromptSelectorProps = {
    promptSelectionCallback?: (prompt: string) => void;
}

type PromptSelectionRecordProps = {
    prompt: string,
    promptSelectionCallback?: () => void,
    promptDeleteHandler?: () => void
}

type SystemPromptsStateType = SystemPromptBackendResponse[] | undefined;

function useSystemPromptsLibrary() {
    const systemPromptsLibraryQuery = useQuery({
        queryKey: ['prompts'],
        queryFn: getPopularSystemPromptsRequest
    });

    const systemPromptDeleteOptimisticConfig = optimisticQueryUpdateConstructor({
        queryKey: ['prompts'],
        stateUpdate: (promptId: string, prevPrompts: SystemPromptsStateType) => {
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



export default function PromptSelector({promptSelectionCallback}: PromptSelectorProps) {
    const { systemPromptsLibraryQuery, deleteSystemPrompt } = useSystemPromptsLibrary();

    return (
        <div id="prompt-selector-container">
            {
                systemPromptsLibraryQuery.isLoading ? "Loading prompts list..." :
                systemPromptsLibraryQuery.isError ? "Error occured while loading prompts" :
                systemPromptsLibraryQuery.isSuccess ? (
                    systemPromptsLibraryQuery.data.map((prompt) => {
                    return <PromptSelectorRecord key={prompt.id} prompt={prompt.content}
                                                 promptSelectionCallback={funcClosureOrUndefined(promptSelectionCallback, prompt.content)}
                                                 promptDeleteHandler={funcClosureOrUndefined(deleteSystemPrompt, prompt.id)}/>
                })) : null
            }
        </div>
    );
}

function PromptSelectorRecord({prompt, promptSelectionCallback, promptDeleteHandler}: PromptSelectionRecordProps) {
    return (
        <div className="prompt-selection-record-container">
            <b className="prompt-selection-record" onClick={promptSelectionCallback}>{prompt}</b>
            <button onClick={promptDeleteHandler}>Delete</button>
        </div>
    );
}