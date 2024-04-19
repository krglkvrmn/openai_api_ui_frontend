import React, {useRef} from "react"
import {Signal} from "@preact/signals-react";
import styles from "./style.module.css";
import {PromptSubmitButton} from "../../ui/Buttons/PromptSubmitButton/PromptSubmitButton.tsx";


type PromptSubmitHandler = (text: string) => void;


type BasePromptProps = {
    promptValue?: Signal<string> | string,
    promptValueChangeHandler?: (prompt: string) => void,
    placeholder?: string,
    promptInputRef?: React.RefObject<HTMLTextAreaElement>,
    onSubmit?: () => void,
    active?: boolean,
    children?: React.ReactNode
}

interface TypedPromptProps {
    promptValue?: Signal<string> | string,
    promptValueChangeHandler?: (prompt: string) => void,
    submitHandler: PromptSubmitHandler,
    active?: boolean
}


export function UserPrompt(
    {promptValue, promptValueChangeHandler, submitHandler, active}: TypedPromptProps
) {
    const [promptInputRef, onPromptSubmit] = usePromptInputSubmitRef(undefined, submitHandler);
    return (
        <BasePrompt promptValue={promptValue}
                    promptValueChangeHandler={promptValueChangeHandler}
                    placeholder="Enter your prompt here"
                    promptInputRef={promptInputRef}
                    onSubmit={onPromptSubmit}
                    active={active} />
    );
}

export function SystemPrompt(
    {promptValue, promptValueChangeHandler, submitHandler, active}: TypedPromptProps
) {
    const [promptInputRef, onPromptSubmit] = usePromptInputSubmitRef(ref => {
        if (ref.current !== null && ref.current.parentElement !== null) {
            ref.current.parentElement.style.display = "none";
        }
    }, submitHandler);
    return (
        <BasePrompt promptValue={promptValue}
                    promptValueChangeHandler={promptValueChangeHandler}
                    placeholder="Describe rules and context for this chat"
                    promptInputRef={promptInputRef}
                    onSubmit={onPromptSubmit}
                    active={active} />
    );
}


function BasePrompt(
    {promptValue, promptValueChangeHandler, placeholder, promptInputRef, onSubmit, active, children}: BasePromptProps
    ) {

    function adjustInputSize() {
        if (promptInputRef !== undefined && promptInputRef.current !== null) {
            promptInputRef.current.style.height = "20px";
            promptInputRef.current.style.height = promptInputRef.current.scrollHeight + 'px';
        }
    }

    function submitHandler() {
        onSubmit && onSubmit();
        adjustInputSize();
    }

    function onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        if (promptValueChangeHandler !== undefined) {
            promptValueChangeHandler(event.target.value);
        }
        adjustInputSize();
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (onSubmit !== undefined && event.key === 'Enter' && active) {
            event.preventDefault();
            submitHandler();
        }
    }

    return (
        <div className={styles.promptContainer}>
            <div className={styles.promptInputContainer}>
                <textarea placeholder={placeholder}
                          ref={promptInputRef}
                          value={typeof promptValue === "string" || typeof promptValue === "undefined" ? promptValue : promptValue.value}
                          onChange={onChange}
                          onKeyDown={onKeyDown} rows={1}/>
            </div>
            {children}
            { active && <PromptSubmitButton onClick={submitHandler} /> }
        </div>
    )
}

function usePromptInputSubmitRef(
    onSubmitSideEffect?: (inputRef: React.RefObject<HTMLTextAreaElement>) => void,
    submitValueHandler?: PromptSubmitHandler
    ): [React.RefObject<HTMLTextAreaElement>, () => void] {
    const promptInputRef = useRef<HTMLTextAreaElement | null>(null);

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
