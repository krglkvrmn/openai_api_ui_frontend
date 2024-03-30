export type UserErrors = string[];
export type ValidatorType = (formData: FormData) => {
    valid: boolean,
    errors: UserErrors
}

export type LocationStateType = {
    redirectFrom?: string,
    reason: string,
    message: string
}

export type PromptType = "user" | "system";