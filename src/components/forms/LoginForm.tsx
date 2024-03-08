import { FormEvent } from "react";
import { useForm } from "../../hooks/useForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/contextHooks";
import {UserErrors, ValidatorType} from "../../types/types";
import {EmailInput, PasswordInput} from "./Inputs.tsx";


type TuseLoginFormReturn = {
    validationErrors: UserErrors,
    logInError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const validators: ValidatorType[] = [];


function useLoginForm(): TuseLoginFormReturn {
    const navigate = useNavigate();
    const { authDispatchers, logInError } = useAuth();
    const { logIn } = authDispatchers;
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

    return { validationErrors, logInError, onFormSubmit };
}

export function LoginForm() {
    const { validationErrors, logInError, onFormSubmit } = useLoginForm();
    return (
        <div>
            {validationErrors.map((error, index) => {
                return <p key={index}>{error}</p>
            })}
            <form onSubmit={onFormSubmit}>
                <label htmlFor="login-email-input">Email:</label>
                <EmailInput id="login-email-input" />
                <br/>
                <label htmlFor="login-password-input">Password:</label>
                <PasswordInput id="login-password-input" />
                <br/>
                <button type="submit">Log In</button>
            </form>
            {logInError}
        </div>

    );
}