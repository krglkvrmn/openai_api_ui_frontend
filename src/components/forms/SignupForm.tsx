import {FormEvent} from "react";
import {useForm} from "../../hooks/useForm";
import {useAuth} from "../../hooks/contextHooks";
import {UserErrors, ValidatorType} from "../../types/types";
import {useNavigate} from "react-router-dom";

type TuseSignupFormReturn = {
    validationErrors: UserErrors,
    signUpError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void
}

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

function useSignupForm(): TuseSignupFormReturn {
    const { authDispatchers, signUpError } = useAuth();
    const { logIn, signUp } = authDispatchers;
    const [validationErrors, onFormSubmit] = useForm(validators);
    const navigate = useNavigate();

    function submitHandler(formData: Record<string, string>): void {
        const data = {email: formData.username, password: formData.password};
        signUp(data).then(() => {
            logIn({username: data.email, password: data.password}).then(() => {
                navigate('/verification', {state: 'just_registered'});
            });
        }).catch(error => console.error('Error while signing up:', error));
    }

    const onFormSubmitWithCallback = (event: FormEvent<HTMLFormElement>) => onFormSubmit(event, submitHandler);
    return { validationErrors, signUpError, onFormSubmit: onFormSubmitWithCallback };
}

export function SignupForm() {
    const { validationErrors, signUpError, onFormSubmit } = useSignupForm();
    return (
        <div>
            {validationErrors.map((error, index) => {
                return <p key={index}>{error}</p>
            })}
            <form onSubmit={onFormSubmit}>
                <label htmlFor="signup-email-input">Email:</label>
                <input id="signup-email-input" 
                       name="username"
                       type="email"
                       placeholder="Enter your email"
                       autoComplete="username" required />
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
            {signUpError}
        </div>
        
    );
}