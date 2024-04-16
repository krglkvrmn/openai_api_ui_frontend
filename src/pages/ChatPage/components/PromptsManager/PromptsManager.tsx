import {MessageAuthor} from "../../../../types/dataTypes.ts";
import {useSystemPrompt} from "../../../../hooks/contextHooks.ts";
import {useEffect, useState} from "react";
import {PromptType} from "../../../../types/types.ts";
import {SwitchPromptTypeButton} from "../../ui/Buttons/SwitchPromptTypeButton/SwitchPromptTypeButton.tsx";
import {SystemPrompt, UserPrompt} from "../Prompt/Prompt.tsx";
import styles from "./style.module.css";

export function PromptsManager(
    {promptSubmitHandler, allowPromptSelection, active}:
    { promptSubmitHandler: (text: string, author: MessageAuthor) => void, allowPromptSelection: boolean, active?: boolean }
) {
    const [systemPromptValue, setSystemPromptValue] = useSystemPrompt();
    const [activePromptType, setActivePromptType] = useState<PromptType>("user");

    useEffect(() => {
        systemPromptValue && allowPromptSelection && setActivePromptType("system");
    }, [systemPromptValue]);
    return (
        <div className={styles.promptsManagerContainer}>
            {
                allowPromptSelection &&
                    <SwitchPromptTypeButton activePromptType={activePromptType}
                                            activePromptTypeSetter={allowPromptSelection ? setActivePromptType : undefined}/>
            }
            {
                (activePromptType === "user" || !allowPromptSelection) &&
                    <UserPrompt submitHandler={prompt => promptSubmitHandler(prompt, 'user')}
                                active={active} />
            }
            {
                activePromptType === "system" && allowPromptSelection &&
                    <SystemPrompt promptValue={systemPromptValue}
                                  promptValueChangeHandler={setSystemPromptValue}
                                  submitHandler={prompt => {
                                      promptSubmitHandler(prompt, 'system');
                                      setSystemPromptValue('');
                                      setActivePromptType("user")
                                  }}
                                  active={active} />
            }
        </div>
    );

}