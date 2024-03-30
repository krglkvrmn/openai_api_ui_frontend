import {MessageAuthor} from "../../../types/dataTypes.ts";
import {useSystemPrompt} from "../../../hooks/contextHooks.ts";
import {useEffect, useState} from "react";
import {PromptType} from "../../../types/types.ts";
import {SwitchPromptTypeButton} from "../../ui/Buttons/SwitchPromptTypeButton.tsx";
import {SystemPrompt, UserPrompt} from "../Prompt/Prompt.tsx";
import styles from "./style.module.css";

export function PromptsManager(
    {promptSubmitHandler, allowSystemPrompt}:
        { promptSubmitHandler: (text: string, author: MessageAuthor) => void, allowSystemPrompt: boolean }
) {
    const [systemPromptValue, setSystemPromptValue] = useSystemPrompt();
    const [activePromptType, setActivePromptType] = useState<PromptType>("user");

    useEffect(() => {
        systemPromptValue && setActivePromptType("system");
    }, [systemPromptValue]);

    return (
        <div className={styles.promptsManagerContainer}>
            <SwitchPromptTypeButton activePromptType={allowSystemPrompt ? activePromptType : "user"}
                                    activePromptTypeSetter={allowSystemPrompt ? setActivePromptType : undefined}/>
            {
                activePromptType === "user" &&
                <UserPrompt submitHandler={prompt => promptSubmitHandler(prompt, 'user')}/>
            }
            {
                activePromptType === "system" && allowSystemPrompt &&
                <SystemPrompt promptValue={systemPromptValue}
                              promptValueChangeHandler={setSystemPromptValue}
                              submitHandler={prompt => {
                                  promptSubmitHandler(prompt, 'system');
                                  setSystemPromptValue('');
                                  setActivePromptType("user")
                              }}/>
            }
        </div>
    );

}