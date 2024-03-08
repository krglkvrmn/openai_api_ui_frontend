import {FormEvent} from "react";
import {useForm} from "../../hooks/useForm";
import {useAuth} from "../../hooks/contextHooks";
import {UserErrors, ValidatorType} from "../../types/types";
import {useNavigate} from "react-router-dom";
import {passwordsLengthValidator, passwordsMatchValidator} from "../../vallidation/formValidators.ts";
import {EmailInput, NewPasswordInput, RepeatPasswordInput} from "./Inputs.tsx";

type TuseSignupFormReturn = {
    validationErrors: UserErrors,
    signUpError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const validators: ValidatorType[] = [
    passwordsMatchValidator,
    passwordsLengthValidator
];

function useSignupForm(): TuseSignupFormReturn {
    const navigate = useNavigate();
    const { authDispatchers, signUpError } = useAuth();
    const { logIn, signUp } = authDispatchers;
    const { validationErrors, onFormSubmit } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            const data = {email: formData.username, password: formData.password};
            try {
                await signUp(data);
                await logIn({username: data.email, password: data.password});
                navigate('/verification', {state: 'just_registered'})
            } catch (error) {
                console.error('Error while signing up:', error)
                throw error;
            }
        }
    });

    return { validationErrors, signUpError, onFormSubmit: onFormSubmit };
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
                <EmailInput id="signup-email-input" />
                <br/>
                <label htmlFor="signup-password-input">Password:</label>
                <NewPasswordInput id="signup-password-input" />
                <br/>
                <label htmlFor="signup-rep-password-input">Repeat password:</label>
                <RepeatPasswordInput id="signup-rep-password-input" />
                <br />
                <button type="submit">Sign Up</button>
            </form>
            {signUpError}
        </div>
        
    );
}