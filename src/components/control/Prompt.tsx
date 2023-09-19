import { useRef } from "react"


type PromptSubmitHandler = (text: string) => void;


type BasePromptProps = {
    promptType: "system" | "user",
    placeholder?: string,
    promptInputRef?: React.RefObject<HTMLInputElement>,
    onSubmit?: () => void,
    children?: React.ReactNode
}

interface TypedPromptProps {
    submitHandler: PromptSubmitHandler
}


export function UserPrompt(
    {submitHandler}: TypedPromptProps
) {
    const [promptInputRef, onPromptSubmit] = usePromptInputSubmitRef(undefined, submitHandler);
    return (
        <BasePrompt promptType="user"
                    placeholder="Enter your prompt here"
                    promptInputRef={promptInputRef}
                    onSubmit={onPromptSubmit}/>
    );
}

export function SystemPrompt(
    {submitHandler}: TypedPromptProps
) {
    const [promptInputRef, onPromptSubmit] = usePromptInputSubmitRef(ref => {
        if (ref.current !== null && ref.current.parentElement !== null) {
            ref.current.parentElement.style.display = "none";
        }
    }, submitHandler);
    return (
        <BasePrompt promptType="system"
                    placeholder="Enter your system prompt here"
                    promptInputRef={promptInputRef}
                    onSubmit={onPromptSubmit}/>
    );
}


function BasePrompt(
    {promptType, placeholder, promptInputRef, onSubmit, children}: BasePromptProps
    ) {
    
    return (
        <div id={`${promptType}-prompt-container`}
             className="prompt-container">
            <input type="text"
                   id={`${promptType}-prompt-input`}
                   placeholder={placeholder}
                   ref={promptInputRef}
                   onKeyDown={e => {if (onSubmit !== undefined && e.key === 'Enter') {onSubmit()}}}/>
            {children}
            <button type="submit"
                    id="user-prompt-input-submit-button"
                    onClick={onSubmit}>Submit</button>
        </div>
    )
}

function usePromptInputSubmitRef(
    onSubmitSideEffect?: (inputRef: React.RefObject<HTMLInputElement>) => void,
    submitValueHandler?: PromptSubmitHandler
    ): [React.RefObject<HTMLInputElement>, () => void] {
    const promptInputRef = useRef<HTMLInputElement | null>(null);

    function onSubmit() {
        if (promptInputRef.current === null) {
            return;
        }
        if (promptInputRef.current.value.length === 0) {
            console.error('Cannot submit an empty prompt');
            return;
        }
        onSubmitSideEffect !== undefined && onSubmitSideEffect(promptInputRef);
        submitValueHandler !== undefined && submitValueHandler(promptInputRef.current.value);
        promptInputRef.current.value = "";
    }
    return [promptInputRef, onSubmit];

}
