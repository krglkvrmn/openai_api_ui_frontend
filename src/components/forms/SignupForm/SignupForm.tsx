import {FormEvent} from "react";
import {useForm} from "../../../hooks/useForm.ts";
import {useAuth} from "../../../hooks/contextHooks.ts";
import {UserErrors, ValidatorType} from "../../../types/types.ts";
import {useNavigate} from "react-router-dom";
import {passwordsLengthValidator, passwordsMatchValidator} from "../../../vallidation/formValidators.ts";
import {EmailInput, NewPasswordInput, RepeatPasswordInput} from "../Elements/Inputs.tsx";
import {FormSubmitButton} from "../Elements/Buttons.tsx";
import "./style.css"
import FormError, {FormErrorsList} from "../../ui/InfoPanels/Error.tsx";

type TuseSignupFormReturn = {
    validationErrors: UserErrors,
    signUpError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void,
    isLoading: boolean
}

const validators: ValidatorType[] = [
    passwordsMatchValidator,
    passwordsLengthValidator
];

function useSignupForm(): TuseSignupFormReturn {
    const navigate = useNavigate();
    const { authDispatchers, signUpError, dispatchersStatuses } = useAuth();
    const { logIn, signUp } = authDispatchers;
    const isLoading = dispatchersStatuses.signUp === "loading";
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

    return { validationErrors, signUpError, onFormSubmit, isLoading };
}

export function SignupForm() {
    const {validationErrors, signUpError, onFormSubmit, isLoading} = useSignupForm();
    return (
        <div className="signup-form-container auth-form-container">
            <FormErrorsList errors={validationErrors} />
            <form className="signup-form auth-form" onSubmit={onFormSubmit}>
                <div className="signup-form-inputs auth-form-inputs">
                    <label htmlFor="signup-email-input" hidden>Email:</label>
                    <EmailInput id="signup-email-input"/>
                    <label htmlFor="signup-password-input" hidden>Password:</label>
                    <NewPasswordInput id="signup-password-input"/>
                    <label htmlFor="signup-rep-password-input" hidden>Repeat password:</label>
                    <RepeatPasswordInput id="signup-rep-password-input"/>
                </div>
                <FormSubmitButton replaceWithLoader={isLoading}>Sign Up</FormSubmitButton>
            </form>
            <FormError error={signUpError} />
        </div>
    );
}