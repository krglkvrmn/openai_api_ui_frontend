import {useSearchParams} from "react-router-dom";
import {ForgotPasswordForm} from "../../components/forms/ForgotPasswordForm/ForgotPasswordForm.tsx";
import {ResetPasswordForm} from "../../components/forms/ResetPasswordForm/ResetPasswordForm.tsx";


export function ForgotPasswordController() {
    const [searchParams] = useSearchParams();
    const resetPasswordToken = searchParams.get('prt');
    return (
        <div>
            {
                resetPasswordToken === null ?
                    <ForgotPasswordForm /> :
                    <ResetPasswordForm token={resetPasswordToken}/>
            }
        </div>
    );
}