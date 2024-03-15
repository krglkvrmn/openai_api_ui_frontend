import {useSearchParams} from "react-router-dom";
import {ForgotPasswordForm} from "../forms/ForgotPasswordForm/ForgotPasswordForm.tsx";
import {ResetPasswordForm} from "../forms/ResetPasswordForm.tsx";


function PasswordResetRequestController() {
    return (
        <ForgotPasswordForm />
    );
}

function PasswordResetController({token}: {token: string}) {
    return (
        <ResetPasswordForm token={token}/>
    );
}


export function ForgotPasswordController() {
    const [searchParams] = useSearchParams();
    const resetPasswordToken = searchParams.get('prt');
    return (
        <div>
            {
                resetPasswordToken === null ?
                    <PasswordResetRequestController /> :
                    <PasswordResetController token={resetPasswordToken} />
            }
        </div>
    );
}