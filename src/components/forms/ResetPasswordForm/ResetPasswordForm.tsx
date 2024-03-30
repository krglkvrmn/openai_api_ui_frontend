import {useForm} from "../../../hooks/useForm.ts";
import {useAuth} from "../../../hooks/contextHooks.ts";
import {FormEvent, useState} from "react";
import {UserErrors, ValidatorType} from "../../../types/types.ts";
import {Link} from "react-router-dom";
import {passwordsLengthValidator, passwordsMatchValidator} from "../../../vallidation/formValidators.ts";
import {NewPasswordInput, RepeatPasswordInput} from "../Elements/Inputs.tsx";
import commonFormStyles from "../common-form-styles.module.css";
import FormError, {ValidationErrorsList} from "../../ui/InfoPanels/Error.tsx";
import {ElementOrLoader} from "../../ui/Buttons/ElementOrLoader.tsx";
import {FormSubmitButton} from "../../ui/Buttons/FormSubmitButton.tsx";
import styles from "./style.module.css";


type TuseResetPasswordFormReturn = {
    validationErrors: UserErrors,
    passwordResetError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void,
    isSuccess: boolean | null,
    isLoading: boolean
}

const validators: ValidatorType[] = [
    passwordsMatchValidator,
    passwordsLengthValidator
];

function useResetPasswordForm(): TuseResetPasswordFormReturn {
    const { passwordResetError, authDispatchers } = useAuth();
    const { resetPassword } = authDispatchers;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { validationErrors, onFormSubmit, isSuccess } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            try {
                setIsLoading(true);
                await resetPassword({token: formData.token, password: formData.password});
            } catch (error) {
                console.error('Error while resetting password:', error);
                throw error;
            } finally {
                setIsLoading(false);
            }
        }
    });
    return { validationErrors, passwordResetError, onFormSubmit, isSuccess, isLoading };
}

export function ResetPasswordForm({token}: { token: string }) {
    const { validationErrors, passwordResetError, onFormSubmit, isSuccess, isLoading } = useResetPasswordForm();
    return (
        <div>
            {
                isSuccess ?
                    <p className={styles.successfulResetPasswordMessage}>You successfully set the new password. You can <Link to='/login'>Log in</Link> or close this page</p> :
                    <div className={commonFormStyles.authFormContainer}>
                        <form className={commonFormStyles.authForm} onSubmit={onFormSubmit}>
                            <ValidationErrorsList errors={validationErrors}/>
                            <div className={commonFormStyles.authFormInputs}>
                                <label htmlFor="reset-password-input" hidden>Password</label>
                                <NewPasswordInput id='reset-password-input' placeholder="New password" />
                                <label htmlFor="reset-password-input-rep" hidden>Repeat password</label>
                                <RepeatPasswordInput id='reset-password-input-rep'/>
                                <input name="token" type="hidden" value={token}/>
                            </div>
                            <ElementOrLoader isLoading={isLoading}>
                                <FormSubmitButton>Reset password</FormSubmitButton>
                            </ElementOrLoader>
                        </form>
                        <FormError error={passwordResetError} />
                    </div>
            }
        </div>
    );
}
