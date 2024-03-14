import { FormEvent } from "react";
import { useForm } from "../../../hooks/useForm.ts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/contextHooks.ts";
import {UserErrors, ValidatorType} from "../../../types/types.ts";
import {EmailInput, PasswordInput} from "../Elements/Inputs.tsx";
import FormError from "../../ui/InfoPanels/Error.tsx";
import "./style.css";
import {FormSubmitButton} from "../Elements/Buttons.tsx";


type TuseLoginFormReturn = {
    validationErrors: UserErrors,
    logInError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void,
    isLoading: boolean
}

const validators: ValidatorType[] = [];


function useLoginForm(): TuseLoginFormReturn {
    const navigate = useNavigate();
    const { authDispatchers, logInError, dispatchersStatuses } = useAuth();
    const { logIn } = authDispatchers;
    const isLoading = dispatchersStatuses.logIn === "loading";
    const { validationErrors, onFormSubmit } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            const data = {username: formData.username, password: formData.password};
            try {
                await logIn(data);
                navigate('/');
            } catch (error) {
                console.error('Error while logging in:', error);
                throw error;
            }
        }
    });

    return { validationErrors, logInError, onFormSubmit, isLoading };
}

export function LoginForm() {
    const { validationErrors, logInError, onFormSubmit, isLoading } = useLoginForm();
    return (
        <div className="login-form-container auth-form-container">
            {validationErrors.map((error, index) => {
                return <p key={index}>{error}</p>
            })}
            <form className="login-form auth-form" onSubmit={onFormSubmit}>
                <div className="login-form-inputs auth-form-inputs">
                    <label htmlFor="login-email-input" hidden>Email</label>
                    <EmailInput id="login-email-input"/>
                    <label htmlFor="login-password-input" hidden>Password</label>
                    <PasswordInput id="login-password-input"/>
                </div>
                <FormSubmitButton replaceWithLoader={isLoading}>Log In</FormSubmitButton>
            </form>
            <FormError error={logInError} />
        </div>

    );
}