import {Link} from "react-router-dom";
import {SignupForm} from "../../components/forms/SignupForm/SignupForm.tsx";
import {ModalCard} from "../../components/ui/Layout/ModalCard/ModalCard.tsx";
import "./style.css";


export default function RegisterPage() {
    return (
        <ModalCard>
            <SignupForm />
            <nav className="signup-other-options-container">
                <Link className="login-page-redirect-link" to="/login">To login page</Link>
            </nav>
        </ModalCard>
    );
}