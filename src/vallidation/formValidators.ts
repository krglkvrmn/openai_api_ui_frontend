import {ValidatorType} from "../types/types.ts";

export const passwordsMatchValidator: ValidatorType = (formData) => {
    return formData.get("password") !== formData.get("reppassword") ?
        {valid: false, errors: ["Passwords do not match"]} :
        {valid: true, errors: []}
}
export const passwordsLengthValidator: ValidatorType = (formData) => {
    const password = formData.get("password") as string;
    return password !== null && password.length < 8 ?
        {valid: false, errors: ["Password must contain at least 8 symbols!"]} :
        {valid: true, errors: []}
}

export const apiKeyNotEmptyValidator: ValidatorType = (formData) => {
    return !formData.get("api_key") ?
        {valid: false, errors: ["API key is not set"]} :
        {valid: true, errors: []}
}