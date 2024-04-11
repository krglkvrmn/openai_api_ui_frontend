import {ForgotPasswordController} from "./ForgotPasswordController.tsx";
import {ModalCard} from "../../components/layout/ModalCard/ModalCard.tsx";
import {Link} from "react-router-dom";
import globalStyles from "../../styles/global-styles.module.css";
import {AuthFormNavigator} from "../../components/layout/AuthFormNavigator/AuthFormNavigator.tsx";

export function ForgotPasswordPage() {
    return (
        <ModalCard showBorder>
            <ForgotPasswordController/>
            <AuthFormNavigator>
                <Link className={globalStyles.navLink} to="/login">Back to login page</Link>
            </AuthFormNavigator>
        </ModalCard>
);
}