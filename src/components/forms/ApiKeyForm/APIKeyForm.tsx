import {useForm} from "../../../hooks/useForm";
import {useLocalAPIKey} from "../../../hooks/contextHooks";
import {ValidatorType} from "../../../types/types.ts";
import {apiKeyNotEmptyValidator} from "../formValidators.ts";
import styles from "./style.module.css";
import React, {useState} from "react";
import {ValidationErrorsList} from "../../ui/InfoDisplay/Errors/Errors.tsx";
import {ElementOrLoader} from "../../ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {APIKeyInput} from "../FormElements/Inputs.tsx";
import {APIKeySubmitButton} from "../../../pages/ChatPage/ui/Buttons/APIKeySubmitButton/APIKeySubmitButton.tsx";
import {devConsole} from "../../../utils/devConsole.ts";


const validators: ValidatorType[] = [
    apiKeyNotEmptyValidator
]

export function APIKeyForm({keySaveHandler}: {keySaveHandler: (apiToken: string) => Promise<unknown>}) {
    const [localAPIKey, setLocalApiKey] = useLocalAPIKey();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { validationErrors, onFormSubmit } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            try {
                setIsLoading(true);
                await keySaveHandler(formData.api_key);
                setLocalApiKey("");
            } catch (error) {
                devConsole.error('Error while saving an API key:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
    });
    return (
        <div className={styles.apiKeyFormContainer} >
            <ValidationErrorsList errors={validationErrors} />
            <form method={undefined} onSubmit={onFormSubmit} className={styles.apiKeyForm}
                  data-tooltip="You do not need to save the key, the chat works as long as the key stays here"
                  data-tooltip-direction="bottom">
                <label htmlFor="api-key-input" hidden>OpenAI API key</label>
                <APIKeyInput id="api-key-input" value={localAPIKey.value}

                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalApiKey(e.target.value)}/>
                {
                    localAPIKey.value !== "" &&
                    <div className={styles.formSubmitButtonContainer}>
                        <ElementOrLoader isLoading={isLoading}>
                            <APIKeySubmitButton />
                        </ElementOrLoader>
                    </div>
                }
            </form>
        </div>
    );
}

