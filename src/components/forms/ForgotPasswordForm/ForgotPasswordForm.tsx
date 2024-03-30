import {useForm} from "../../../hooks/useForm.ts";
import {useAuth} from "../../../hooks/contextHooks.ts";
import {FormEvent, useState} from "react";
import {UserErrors} from "../../../types/types.ts";
import {EmailInput} from "../Elements/Inputs.tsx";
import {useNavigate} from "react-router-dom";
import FormError, {ValidationErrorsList} from "../../ui/InfoPanels/Error.tsx";
import commonFormStyles from "../common-form-styles.module.css";
import {FormSubmitButton} from "../../ui/Buttons/FormSubmitButton.tsx";
import {ElementOrLoader} from "../../ui/Buttons/ElementOrLoader.tsx";


type TuseForgotPasswordFormReturn = {
    validationErrors: UserErrors,
    passwordResetError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void,
    isSuccess: null | boolean,
    isLoading: boolean
}



function useForgotPasswordForm(): TuseForgotPasswordFormReturn {
    const navigate = useNavigate();
    const { passwordResetError, authDispatchers } = useAuth();
    const { requestPasswordReset } = authDispatchers;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { validationErrors, onFormSubmit, isSuccess } = useForm({
        validators: [],
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            setIsLoading(true);
            try {
                await requestPasswordReset(formData.username);
                navigate('/login', { state: 'password-reset-request' });
            } catch (error) {
                console.error('Error while requesting password reset:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        }
    });

    return { validationErrors, passwordResetError, onFormSubmit, isSuccess, isLoading };
}

export function ForgotPasswordForm() {
    const { validationErrors, passwordResetError, onFormSubmit, isLoading } = useForgotPasswordForm();
    return (
        <div className={commonFormStyles.authFormContainer}>
            <ValidationErrorsList errors={validationErrors} />
            <form className={commonFormStyles.authForm} onSubmit={onFormSubmit}>
                <div className={commonFormStyles.authFormInputs}>
                    <label htmlFor="forgot-password-email-input" hidden>Email</label>
                    <EmailInput id='forgot-password-email-input'/>
                </div>
                <ElementOrLoader isLoading={isLoading} >
                    <FormSubmitButton>Continue</FormSubmitButton>
                </ElementOrLoader>
            </form>
            <FormError error={passwordResetError} />
        </div>
    );
}