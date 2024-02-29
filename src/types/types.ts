export type UserErrors = string[];
export type ValidatorType = (formData: FormData) => {
    valid: boolean,
    errors: UserErrors
}