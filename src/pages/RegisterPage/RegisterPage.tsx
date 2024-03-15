import {Link} from "react-router-dom";
import {SignupForm} from "../../components/forms/SignupForm/SignupForm.tsx";
import {ModalCard} from "../../components/ui/Layout/ModalCard/ModalCard.tsx";
import styles from "./style.module.css";
import globalStyles from "../../styles/global-styles.module.css";

export default function RegisterPage() {
    return (
        <ModalCard showBorder>
            <SignupForm />
            <nav className={styles.authFormNavContainer}>
                <Link className={globalStyles.navLink} to="/login">To login page</Link>
            </nav>
        </ModalCard>
    );
}