import {useForm} from "../../hooks/useForm.ts";
import {useAuth} from "../../hooks/contextHooks.ts";
import {FormEvent} from "react";
import {UserErrors, ValidatorType} from "../../types/types.ts";
import {Link} from "react-router-dom";
import {passwordsLengthValidator, passwordsMatchValidator} from "../../vallidation/formValidators.ts";
import {NewPasswordInput, RepeatPasswordInput} from "./Elements/Inputs.tsx";


type TuseResetPasswordFormReturn = {
    validationErrors: UserErrors,
    passwordResetError: string | null,
    onFormSubmit: (event: FormEvent<HTMLFormElement>) => void,
    isSuccess: boolean | null
}

const validators: ValidatorType[] = [
    passwordsMatchValidator,
    passwordsLengthValidator
];

function useResetPasswordForm(): TuseResetPasswordFormReturn {
    const { passwordResetError, authDispatchers } = useAuth();
    const { resetPassword } = authDispatchers;
    const { validationErrors, onFormSubmit, isSuccess } = useForm({
        validators,
        submitHandler: async (formData: Record<string, string>): Promise<void> => {
            try {
                await resetPassword({token: formData.token, password: formData.password});
            } catch (error) {
                console.error('Error while resetting password:', error);
                throw error;
            }
        }
    });
    return { validationErrors, passwordResetError, onFormSubmit, isSuccess };
}

export function ResetPasswordForm({token}: { token: string }) {
    const { validationErrors, passwordResetError, onFormSubmit, isSuccess } = useResetPasswordForm();
    return (
        <div>
            {
                isSuccess ?
                    <p>You successfully set the new password. You can <Link to='/login'>Log in</Link> or close this page</p> :
                    <>
                        <form onSubmit={onFormSubmit}>
                            {validationErrors.map((error, index) => {
                                return <p key={index}>{error}</p>
                            })}
                            <label>Password:</label>
                            <NewPasswordInput id='reset-password-input' />
                            <br/>
                            <label>Repeat password:</label>
                            <RepeatPasswordInput id='reset-password-input-rep' />
                            <input name="token" type="hidden" value={token}/>
                            <br/>
                            <button type="submit">Reset password</button>
                        </form>
                        {passwordResetError}
                    </>
            }

        </div>
    );
}
