import {Link} from "react-router-dom";
import {SignupForm} from "../../components/forms/SignupForm/SignupForm.tsx";
import {ModalCard} from "../../components/layout/ModalCard/ModalCard.tsx";
import globalStyles from "../../styles/global-styles.module.css";
import {AuthFormNavigator} from "../../components/layout/AuthFormNavigator/AuthFormNavigator.tsx";

export default function RegisterPage() {
    return (
        <ModalCard showBorder>
            <SignupForm />
            <AuthFormNavigator>
                <Link className={globalStyles.navLink} to="/login">To login page</Link>
            </AuthFormNavigator>
        </ModalCard>
    );
}