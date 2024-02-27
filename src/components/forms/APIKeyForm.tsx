import {FormEvent} from "react";
import {useForm, ValidatorType} from "../../hooks/useForm";
import {saveAPIKeyRequest} from "../../services/backendAPI";
import {queryClient} from "../../App";
import {useAPIKey} from "../../hooks/contextHooks";


const validators: ValidatorType[] = [
    formData => {
        return !formData.get("api_key") ? 
            {valid: false, errors: ["API key is not set"]} :
            {valid: true, errors: []}
    }
]

export function APIKeyForm() {
    const setApiKey = useAPIKey()[1];
    const [validationErrors, onFormSubmit] = useForm(validators);

    function submitHandler(formData: any): void {
        saveAPIKeyRequest(formData.api_key).then(response => {
            queryClient.invalidateQueries(['apiKeys'], { exact: true });
        }).catch(error => console.error('Error while saving an API key'));
    }
    const onFormSubmitWithCallback = (event: FormEvent<HTMLFormElement>) => onFormSubmit(event, submitHandler);
    return (
        <>
            {validationErrors.map((error, index) => {
                return <p key={index}>{error}</p>
            })}
            <form onSubmit={onFormSubmitWithCallback}>
                <input type="password" name="api_key" id="api-key-input" onChange={e => setApiKey(e.target.value)}/>
                <button>Save</button>
            </form>
        </>
    );
}