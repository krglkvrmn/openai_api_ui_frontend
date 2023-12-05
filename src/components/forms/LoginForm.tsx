import { FormEvent } from "react";
import { ValidatorType, useForm } from "../../hooks/useForm";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import { useAuth } from "../../hooks/useAuth";
import { UserErrors } from "../../types";


type TuseLoginFormReturn = {
    validationErrors: UserErrors,
    logInError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const validators: ValidatorType[] = [];

export function useLoginForm(): TuseLoginFormReturn {
    const { authDispatchers, logInError } = useAuth();
    const { logIn } = authDispatchers;
    const [validationErrors, onFormSubmit] = useForm(validators);
    const navigate = useNavigate();

    function submitHandler(formData: any) {
        const data = {username: formData.username, password: formData.password};
        logIn(data).then(response => {
            console.log('Successfully logged in');
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