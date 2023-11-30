import { FormEvent } from "react";
import { ValidatorType, useForm } from "../../hooks/useForm";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import { useAuth } from "../../contexts/auth";


type TuseLoginFormReturn = [
    string[],
    (event: FormEvent<HTMLFormElement>) => void
]

const validators: ValidatorType[] = [];

export function useLoginForm(): TuseLoginFormReturn {
    const [user, signIn, signOut] = useAuth();
    const [errors, setErrors, onFormSubmit] = useForm(validators);
    const navigate = useNavigate();

    function submitHandler(formData: any) {
        const data = {username: formData.username, password: formData.password};
        login(data).then(loginInfo => {
            if (loginInfo.detail === "LOGIN_BAD_CREDENTIALS") {
                setErrors(prev => [...prev, "Incorrect email or password"])
            } else {
                signIn({email: data.username});
                navigate('/');
            }
        }).catch(error => {
            setErrors(prev => [...prev, "An error occured during login"])
        })
    }

    const onFormSubmitWithCallback = (event: FormEvent<HTMLFormElement>) => onFormSubmit(event, submitHandler);
    return [errors, onFormSubmitWithCallback];
}

export function LoginForm() {
    const [errors, onFormSubmit] = useLoginForm();
    return (
        <div>
            {errors.map((error, index) => {
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
        </div>
        
    );
}