import {ForgotPasswordController} from "../../components/control/PasswordResetController.tsx";
import {ModalCard} from "../../components/ui/Layout/ModalCard/ModalCard.tsx";
import {Link} from "react-router-dom";
import styles from "./style.module.css";
import globalStyles from "../../styles/global-styles.module.css";

export function ForgotPasswordPage() {
    return (
        <ModalCard showBorder>
            <ForgotPasswordController />
            <nav className={styles.authFormNavContainer}>
                <Link className={globalStyles.navLink} to="/login">Back to login page</Link>
            </nav>
        </ModalCard>
    );
}