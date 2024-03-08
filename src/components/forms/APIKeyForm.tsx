import {useForm} from "../../hooks/useForm";
import {saveAPIKeyRequest} from "../../services/backendAPI";
import {useAPIKey} from "../../hooks/contextHooks";
import {ValidatorType} from "../../types/types.ts";
import {queryClient} from "../../queryClient.ts";


const validators: ValidatorType[] = [
    formData => {
        return !formData.get("api_key") ? 
            {valid: false, errors: ["API key is not set"]} :
            {valid: true, errors: []}
    }
]

export function APIKeyForm() {
    const setApiKey = useAPIKey()[1];
    const { validationErrors, onFormSubmit } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            try {
                await saveAPIKeyRequest(formData.api_key);
                await queryClient.invalidateQueries(['api_keys']);
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
                <input type="password" name="api_key" id="api-key-input" onChange={e => setApiKey(e.target.value)}/>
                <button>Save</button>
            </form>
        </>
    );
}