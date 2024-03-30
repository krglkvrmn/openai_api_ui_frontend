import {FormEvent} from "react";
import {useForm} from "../../../hooks/useForm.ts";
import {useAuth} from "../../../hooks/contextHooks.ts";
import {UserErrors, ValidatorType} from "../../../types/types.ts";
import {useNavigate} from "react-router-dom";
import {passwordsLengthValidator, passwordsMatchValidator} from "../../../vallidation/formValidators.ts";
import {EmailInput, NewPasswordInput, RepeatPasswordInput} from "../Elements/Inputs.tsx";
import FormError, {ValidationErrorsList} from "../../ui/InfoPanels/Error.tsx";
import commonFormStyles from "../common-form-styles.module.css";
import {FormSubmitButton} from "../../ui/Buttons/FormSubmitButton.tsx";
import {ElementOrLoader} from "../../ui/Buttons/ElementOrLoader.tsx";

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
        <div className={commonFormStyles.authFormContainer}>
            <ValidationErrorsList errors={validationErrors} />
            <form className={commonFormStyles.authForm} onSubmit={onFormSubmit}>
                <div className={commonFormStyles.authFormInputs}>
                    <label htmlFor="signup-email-input" hidden>Email:</label>
                    <EmailInput id="signup-email-input"/>
                    <label htmlFor="signup-password-input" hidden>Password:</label>
                    <NewPasswordInput id="signup-password-input"/>
                    <label htmlFor="signup-rep-password-input" hidden>Repeat password:</label>
                    <RepeatPasswordInput id="signup-rep-password-input"/>
                </div>
                <ElementOrLoader isLoading={isLoading}>
                    <FormSubmitButton>Sign Up</FormSubmitButton>
                </ElementOrLoader>
            </form>
            <FormError error={signUpError} />
        </div>
    );
}