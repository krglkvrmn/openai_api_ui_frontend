import React, { FormEvent, SyntheticEvent } from "react";
import { useRef, useState } from "react";
import { UserErrors } from "../types";

type TuseFormReturn = [
    UserErrors,
    (event: FormEvent<HTMLFormElement>, submitHandler: (formFata: any) => void) => void
]

export type ValidatorType = (formData: FormData) => {
    valid: boolean,
    errors: UserErrors
}

type ValidatedFormType = {
    valid: boolean,
    data?: any,
    errors: UserErrors
}

export function useForm(validators: ValidatorType[]): TuseFormReturn {
    const [validationErrors, setValidationErrors] = useState<UserErrors>([]);

    function validateForm(formData: FormData) {
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
                validatedForm.data[key] = value;
            });
        }
        return validatedForm;
    }

    function onFormSubmit(event: FormEvent<HTMLFormElement>, submitHandler: (formData: any) => void) {
        event.preventDefault();
        if (event.target === null) {
            return;
        }
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const {valid, data, errors} = validateForm(formData);
        setValidationErrors(errors);
        if (valid) {
            submitHandler(data)
        }
    }

    return [validationErrors, onFormSubmit];
}