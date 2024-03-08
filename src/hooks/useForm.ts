import {FormEvent, useState} from "react";
import {UserErrors, ValidatorType} from "../types/types";

type FormSubmitHandler = (formFata: Record<string, string>) => Promise<void>;


type TuseFormReturn = {
    validationErrors: UserErrors,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>,
    isSubmitted: boolean,
    isSuccess: boolean | null
}

type ValidatedFormType = {
    valid: boolean,
    data?: Record<string, string>,
    errors: UserErrors
}

export function useForm(
    {validators, submitHandler}: { validators: ValidatorType[], submitHandler: FormSubmitHandler }
): TuseFormReturn {
    const [ validationErrors, setValidationErrors ] = useState<UserErrors>([]);
    const [ isSubmitted, setIsSubmitted ] = useState<boolean>(false);
    const [ isSuccess, setIsSuccess ] = useState<boolean | null>(null);

    function validateForm(formData: FormData): ValidatedFormType {
        let validatedForm: ValidatedFormType = {valid: true, errors: []};

        let validationResults;
        validators.forEach(validator => {
            validationResults = validator(formData);
            validatedForm = {
                valid: validatedForm.valid && validationResults.valid,
                errors: [...validatedForm.errors, ...validationResults.errors],
            }
        });
        if (validatedForm.valid) {
            validatedForm.data = {};
            formData.forEach((value, key) => {
                if (typeof value === 'string') {
                    validatedForm.data![key] = value;
                } else {
                    throw new Error(`Invalid value type for form field ${key}: ${typeof value}`)
                }
            });
        }
        return validatedForm;
    }

    async function onFormSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (event.target === null) {
            return;
        }
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const {valid, data, errors} = validateForm(formData);
        setValidationErrors(errors);
        if (valid && data !== undefined) {
            try {
                setIsSubmitted(true);
                await submitHandler(data);
                setIsSuccess(true);
            } catch (error) {
                setIsSuccess(false)
            }
        }
    }

    return { validationErrors, onFormSubmit, isSubmitted, isSuccess };
}