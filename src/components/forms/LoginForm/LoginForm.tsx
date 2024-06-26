import {FormEvent, useState} from "react";
import { useForm } from "../../../hooks/useForm.ts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/contextHooks.ts";
import {UserErrors, ValidatorType} from "../../../types/types.ts";
import {EmailInput, PasswordInput} from "../FormElements/Inputs.tsx";
import FormError, {ValidationErrorsList} from "../../ui/InfoDisplay/Errors/Errors.tsx";
import commonFormStyles from "../common-form-styles.module.css";
import {FormSubmitButton} from "../../ui/Buttons/Generic/FormSubmitButton/FormSubmitButton.tsx";
import {ElementOrLoader} from "../../ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {devConsole} from "../../../utils/devConsole.ts";


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
    const [isCalledInternally, setIsCalledInternally] = useState<boolean>(false);
    const isLoading = dispatchersStatuses.logIn === "loading" && isCalledInternally;
    const { validationErrors, onFormSubmit } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            const data = {username: formData.username, password: formData.password};
            try {
                setIsCalledInternally(true);
                await logIn(data);
                navigate('/');
            } catch (error) {
                devConsole.error('Error while logging in:', error);
                throw error;
            } finally {
                setIsCalledInternally(false);
            }
        }
    });

    return { validationErrors, logInError, onFormSubmit, isLoading };
}

export function LoginForm() {
    const { validationErrors, logInError, onFormSubmit, isLoading } = useLoginForm();
    return (
        <div className={commonFormStyles.authFormContainer}>
            <ValidationErrorsList errors={validationErrors} />
            <form className={commonFormStyles.authForm} onSubmit={onFormSubmit}>
                <div className={commonFormStyles.authFormInputs}>
                    <label htmlFor="login-email-input" hidden>Email</label>
                    <EmailInput id="login-email-input"/>
                    <label htmlFor="login-password-input" hidden>Password</label>
                    <PasswordInput id="login-password-input"/>
                </div>
                <ElementOrLoader isLoading={isLoading}>
                    <FormSubmitButton>Log In</FormSubmitButton>
                </ElementOrLoader>
            </form>
            <FormError error={logInError} />
        </div>

    );
}