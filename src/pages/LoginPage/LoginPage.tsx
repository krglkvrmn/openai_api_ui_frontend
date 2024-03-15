import {Link, useLocation} from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm/LoginForm.tsx";
import {useAuth} from "../../hooks/contextHooks.ts";
import {GithubLoginButton, GoogleLoginButton} from "react-social-login-buttons";
import FormError from "../../components/ui/InfoPanels/Error.tsx";
import {FormInfo} from "../../components/ui/InfoPanels/Info.tsx";
import {ModalCard} from "../../components/ui/Layout/ModalCard/ModalCard.tsx";
import styles from "./style.module.css";
import globalStyles from "../../styles/global-styles.module.css";
import {GuestLoginButton} from "../../components/ui/Buttons/GuestLoginButton.tsx";

export default function LoginPage() {
    const location = useLocation();
    // const { error: guestLoginError, loginAsGuest } = useGuestLogin();
    const { guestLogInError, authDispatchers, dispatchersStatuses } = useAuth();
    const { oidcLogin, logInAsGuest } = authDispatchers;
    const isGuestLoginLoading = dispatchersStatuses.loginAsGuest === "loading";

    let redirectMessage: string | undefined = undefined;
    const state = location.state;
    switch (state) {
        case 'password-reset-request':
            redirectMessage = 'A link to reset your password was sent to your email'; break;
    }

    return (
        <ModalCard showBorder>
            <FormInfo infoMessage={redirectMessage} />
            <LoginForm/>
            <hr/>
            <div className={styles.alternativeLoginOptionsContainer}>
                <div className={styles.socialLoginsContainer}>
                    <GoogleLoginButton align="center"
                                       size="2rem"
                                       onClick={() => oidcLogin('google')}/>
                    <GithubLoginButton align="center"
                                       size="2rem"
                                       onClick={() => oidcLogin('github')}/>
                </div>
                <div className={styles.guestLoginContainer}>
                    <span>Or</span>
                    <GuestLoginButton replaceWithLoader={isGuestLoginLoading} onClick={logInAsGuest} />
                </div>
            </div>
            <FormError error={guestLogInError} />
            <nav className={styles.authFormNavContainer}>
                <Link className={globalStyles.navLink} to="/register">Not registered yet?</Link>
                <Link className={globalStyles.navLink} to="/forgot-password">Forgot password?</Link>
            </nav>
        </ModalCard>
    );
}