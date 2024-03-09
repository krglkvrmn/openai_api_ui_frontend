import {useForm} from "../../hooks/useForm";
import {useLocalAPIKey} from "../../hooks/contextHooks";
import {ValidatorType} from "../../types/types.ts";
import {apiKeyNotEmptyValidator} from "../../vallidation/formValidators.ts";


const validators: ValidatorType[] = [
    apiKeyNotEmptyValidator
]

export function APIKeyForm({keySaveHandler}: {keySaveHandler: (apiToken: string) => Promise<unknown>}) {
    const setLocalApiKey = useLocalAPIKey()[1];
    const { validationErrors, onFormSubmit } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            try {
                await keySaveHandler(formData.api_key);
            } catch (error) {
                console.error('Error while saving an API key:', error);
                throw error;
            }
        },
    });

    return (
        <>
            {validationErrors.map((error, index) => {
                return <p key={index}>{error}</p>
            })}
            <form onSubmit={onFormSubmit}>
                <input type="password" name="api_key" id="api-key-input" onChange={e => setLocalApiKey(e.target.value)}/>
                <button>Save</button>
            </form>
        </>
    );
}