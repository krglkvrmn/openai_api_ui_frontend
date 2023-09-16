import { useEffect, useRef, useState } from "react";
import "./style.css";


export type SystemPrompt = {
    content: string,
    popularity: number
}


function fetchSystemPrompts(): SystemPrompt[] {
    const result: SystemPrompt[] = [];
    fetch(
        'http://localhost:8000/api/v1/prompt/system/popular',
        {method: "GET"
    }).then(response => {
        if (!response.ok) {throw new Error('Failed to fetch system prompts')};
        return response.json();
    }).then(prompts => {
        result.push(...prompts);
    }).catch(error => console.error('Error:', error));
    return result;
}

export default function Prompt(
    {promptType, promptInputHandler, promptChoiceSwitchHandler, promptSubmitStatusRef, isActive}:
    {
        promptType: string, promptInputHandler: CallableFunction, promptChoiceSwitchHandler: CallableFunction,
        promptSubmitStatusRef: React.RefObject<boolean>, isActive: boolean
    }
    ) {
    
    const promptInputRef = useRef<HTMLInputElement | null>(null);
    const promptContainerRef = useRef<HTMLDivElement | null>(null);

    const displayStyle = isActive ? undefined : "none";
    const inputPlaceholder: string = promptType === 'user' ? "Enter your prompt here" : "Enter system prompt here";

    function onPromptSubmit() {
        const inputRefContent = promptInputRef.current;
        const containerRefContent = promptContainerRef.current;
        if (promptSubmitStatusRef.current) {
            if (inputRefContent?.value.length == 0) {   // Disable empty prompt submit
                return;
            }
            if (inputRefContent !== null) {
                promptInputHandler(promptType, inputRefContent.value);
                inputRefContent.value = "";    // Reset prompt imput
            }
            if (containerRefContent !== null && promptType === "system") {
                containerRefContent.style.display = "none";   // System prompt can only be submitted once
            }
        }
    }
    return (
        <div className="prompt-container"
             id={`${promptType}-prompt-container`}
             style={{display: displayStyle}}
             ref={promptContainerRef}>
            <input className="prompt-input"
                   id={`${promptType}-prompt-input`}
                   type="text"
                   placeholder={inputPlaceholder}
                   ref={promptInputRef}
                   onKeyDown={e => {if (e.key === 'Enter') {onPromptSubmit()}}}/>
            {promptType === 'system' && 
                <button onClick={() => {}}>Choose</button>
            } 
            <button type="submit"
                    onClick={onPromptSubmit}>Submit</button>
        </div>
    );
}