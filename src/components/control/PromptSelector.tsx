import { useQuery } from "react-query";
import useFetch from "../../hooks/useFetch";
import { PromptType } from "../../types";
import { funcClosureOrUndefined } from "../../utils/functional";
import { getPopularSystemPrompts } from "../../services/backend_api";

type PromptSelectorProps = {
    promptSelectionCallback?: (prompt: string) => void;
}

type PromptSelectionRecordProps = {
    prompt: string;
    promptSelectionCallback?: () => void;
}



export default function PromptSelector({promptSelectionCallback}: PromptSelectorProps) {
    const { data, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['prompts'],
        queryFn: getPopularSystemPrompts 
    });

    return (
        <div id="prompt-selector-container">
            {
                isLoading ? "Loading prompts list..." 
                : isError ? "Error occured while loading prompts"
                : isSuccess ? ( data.map((prompt, index) => {
                    return <PromptSelectorRecord key={index} prompt={prompt.content}
                                                 promptSelectionCallback={funcClosureOrUndefined(promptSelectionCallback, prompt.content)}/>
                })) : null
            }
        </div>
    );
}

function PromptSelectorRecord({prompt, promptSelectionCallback}: PromptSelectionRecordProps) {
    return (
        <div className="prompt-selection-record-container" onClick={promptSelectionCallback}>
            <b className="prompt-selection-record">{prompt}</b>
        </div>
    );
}