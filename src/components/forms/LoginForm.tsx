import { FormEvent } from "react";
import { useForm } from "../../hooks/useForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/contextHooks";
import {UserErrors, ValidatorType} from "../../types/types";


type TuseLoginFormReturn = {
    validationErrors: UserErrors,
    logInError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const validators: ValidatorType[] = [];

function useLoginForm(): TuseLoginFormReturn {
    const { authDispatchers, logInError } = useAuth();
    const { logIn } = authDispatchers;
    const [validationErrors, onFormSubmit] = useForm(validators);
    const navigate = useNavigate();

    function submitHandler(formData: Record<string, string>): void {
        const data = {username: formData.username, password: formData.password};
        logIn(data).then(() => {
            navigate('/');
        }).catch(error => console.error('Error while logging in:', error));
    }

    const onFormSubmitWithCallback = (event: FormEvent<HTMLFormElement>) => onFormSubmit(event, submitHandler);
    return { validationErrors, logInError, onFormSubmit: onFormSubmitWithCallback };
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
                <input id="login-email-input"
                       name="username"
                       type="email"
                       placeholder="Enter your email"
                       autoComplete="username" required/>
                <br/>
                <label htmlFor="login-password-input">Password:</label>
                <input id="login-password-input"
                       name="password"
                       type="password"
                       placeholder="Enter your password"
                       autoComplete="current-password" required/>
                <br />
                <button type="submit">Log In</button>
            </form>
            {logInError}
        </div>
        
    );
}