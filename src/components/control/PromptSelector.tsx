import useFetch from "../../hooks/useFetch";
import { PromptType } from "../../types";
import { funcClosureOrUndefined } from "../../utils/functional";

type PromptSelectorProps = {
    promptSelectionCallback?: (prompt: string) => void;
}

type PromptSelectionRecordProps = {
    prompt: string;
    promptSelectionCallback?: () => void;
}



export default function PromptSelector({promptSelectionCallback}: PromptSelectorProps) {
    const {data, error, loading} = useFetch<PromptType[]>('http://localhost:8000/api/v1/prompt/system/popular', {method: "GET"});

    return (
        <div id="prompt-selector-container">
            {
                data === null ? "Loading prompts list..." :
                data.map((prompt, index) => {
                    return <PromptSelectorRecord key={index} prompt={prompt.content}
                                                 promptSelectionCallback={funcClosureOrUndefined(promptSelectionCallback, prompt.content)}/>
                })
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