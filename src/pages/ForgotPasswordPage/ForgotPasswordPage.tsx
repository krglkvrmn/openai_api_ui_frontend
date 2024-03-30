import {ForgotPasswordController} from "../../components/control/PasswordResetController.tsx";
import {ModalCard} from "../../components/ui/Layout/ModalCard/ModalCard.tsx";
import {Link} from "react-router-dom";
import globalStyles from "../../styles/global-styles.module.css";
import {AuthFormNavigator} from "../../components/layout/AuthFormNavigator/AuthFormNavigator.tsx";

export function ForgotPasswordPage() {
    return (
        <ModalCard showBorder>
            <ForgotPasswordController/>
            <AuthFormNavigator>
                <Link className={globalStyles.navLink} to="/login">Back to login page</Link>
                <Link className={globalStyles.navLink} to="/forgot-password">Request new email</Link>
            </AuthFormNavigator>
        </ModalCard>
);
}