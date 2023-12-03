import { FormEvent, useRef, useState } from "react";
import { ValidatorType, useForm } from "../../hooks/useForm";
import { SignupFormDataType, signup } from "../../services/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

type TuseSignupFormReturn = [
    string[],
    (event: FormEvent<HTMLFormElement>) => void
]

const validators: ValidatorType[] = [
    formData => {
        return formData.get("password") !== formData.get("reppassword") ?
            {valid: false, errors: ["Passwords do not match"]} :
            {valid: true, errors: []}
    },
    formData => {
        const password = formData.get("password") as string;
        return password !== null && password.length < 8 ?
            {valid: false, errors: ["Password must contain at least 8 symbols!"]} :
            {valid: true, errors: []}
    },

];

export function useSignupForm(): TuseSignupFormReturn {
    const {authDispatchers} = useAuth();
    const {signUp} = authDispatchers;
    const [errors, setErrors, onFormSubmit] = useForm(validators);
    const navigate = useNavigate();

    function submitHandler(formData: any) {
        const data = {email: formData.username, password: formData.password};
        signUp(data).then(errors => {
            if (errors.length === 0) {
                navigate('/login');
            }
            setErrors(errors);
        });
    }

    const onFormSubmitWithCallback = (event: FormEvent<HTMLFormElement>) => onFormSubmit(event, submitHandler);
    return [errors, onFormSubmitWithCallback];
}

export function SignupForm() {
    const [errors, onFormSubmit] = useSignupForm();
    return (
        <div>
            {errors.map((error, index) => {
                return <p key={index}>{error}</p>
            })}
            <form onSubmit={onFormSubmit}>
                <label htmlFor="signup-email-input">Email:</label>
                <input id="signup-email-input" 
                       name="username"
                       type="email"
                       placeholder="Enter your email" required />
                <br/>
                <label htmlFor="signup-password-input">Password:</label>
                <input id="signup-password-input"
                       name="password"
                       type="password"
                       placeholder="Enter your password"
                       autoComplete="new-password" required />
                <br/>
                <label htmlFor="signup-rep-password-input">Repeat password:</label>
                <input id="signup-rep-password-input"
                       name="reppassword"
                       type="password"
                       placeholder="Repeat your password"
                       autoComplete="new-password" required />
                <br />
                <button type="submit" onSubmit={e => {console.log(e)}}>Sign Up</button>
            </form>
        </div>
        
    );
}