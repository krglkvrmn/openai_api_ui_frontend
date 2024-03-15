import {useForm} from "../../../hooks/useForm.ts";
import {useAuth} from "../../../hooks/contextHooks.ts";
import {FormEvent} from "react";
import {UserErrors} from "../../../types/types.ts";
import {EmailInput} from "../Elements/Inputs.tsx";
import {useNavigate} from "react-router-dom";
import FormError, {FormErrorsList} from "../../ui/InfoPanels/Error.tsx";
import {FormSubmitButton} from "../Elements/Buttons.tsx";
import commonFormStyles from "../common-form-styles.module.css";


type TuseForgotPasswordFormReturn = {
    validationErrors: UserErrors,
    passwordResetError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void,
    isSuccess: null | boolean
}



function useForgotPasswordForm(): TuseForgotPasswordFormReturn {
    const navigate = useNavigate();
    const { passwordResetError, authDispatchers } = useAuth();
    const { requestPasswordReset } = authDispatchers;
    const { validationErrors, onFormSubmit, isSuccess } = useForm({
        validators: [],
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            try {
                await requestPasswordReset(formData.username);
                navigate('/login', { state: 'password-reset-request' });
            } catch (error) {
                console.error('Error while requesting password reset:', error);
                throw error;
            }
        }
    });

    return { validationErrors, passwordResetError, onFormSubmit, isSuccess };
}

export function ForgotPasswordForm() {
    const { validationErrors, passwordResetError, onFormSubmit } = useForgotPasswordForm();
    return (
        <div className={commonFormStyles.authFormContainer}>
            <FormErrorsList errors={validationErrors} />
            <form className={commonFormStyles.authForm} onSubmit={onFormSubmit}>
                <div className={commonFormStyles.authFormInputs}>
                    <label htmlFor="forgot-password-email-input" hidden>Email</label>
                    <EmailInput id='forgot-password-email-input'/>
                </div>
                <FormSubmitButton>Continue</FormSubmitButton>
            </form>
            <FormError error={passwordResetError} />
        </div>
    );
}