import {useForm} from "../../../hooks/useForm";
import {useLocalAPIKey} from "../../../hooks/contextHooks";
import {ValidatorType} from "../../../types/types.ts";
import {apiKeyNotEmptyValidator} from "../../../vallidation/formValidators.ts";
import styles from "./style.module.css";
import React, {useState} from "react";
import {ValidationErrorsList} from "../../ui/InfoPanels/Error.tsx";
import {ElementOrLoader} from "../../ui/Buttons/ElementOrLoader.tsx";
import {APIKeyInput} from "../Elements/Inputs.tsx";
import {APIKeySubmitButton} from "../../ui/Buttons/APIKeySubmitButton.tsx";


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
            } catch (error) {
                console.error('Error while saving an API key:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <div className={styles.apiKeyFormContainer}>
            <ValidationErrorsList errors={validationErrors} />
            <form onSubmit={onFormSubmit} className={styles.apiKeyForm}>
                <APIKeyInput id="api-key-input" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalApiKey(e.target.value)}/>
                <ElementOrLoader isLoading={isLoading}>
                    {
                        localAPIKey.value !== "" && <APIKeySubmitButton />
                    }
                </ElementOrLoader>
            </form>
        </div>
    );
}

