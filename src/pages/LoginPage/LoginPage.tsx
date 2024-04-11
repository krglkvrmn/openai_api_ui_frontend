import {Link, useLocation} from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm/LoginForm.tsx";
import {useAuth} from "../../hooks/contextHooks.ts";
import {GithubLoginButton, GoogleLoginButton} from "react-social-login-buttons";
import FormError from "../../components/ui/InfoDisplay/Errors/Errors.tsx";
import {FormInfo} from "../../components/ui/InfoDisplay/Info/Info.tsx";
import {ModalCard} from "../../components/layout/ModalCard/ModalCard.tsx";
import styles from "./style.module.css";
import globalStyles from "../../styles/global-styles.module.css";
import {GuestLoginButton} from "./components/ui/Buttons/GuestLoginButton/GuestLoginButton.tsx";
import {ElementOrLoader} from "../../components/ui/Loaders/ElementOrLoader/ElementOrLoader.tsx";
import {AuthFormNavigator} from "../../components/layout/AuthFormNavigator/AuthFormNavigator.tsx";

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
            redirectMessage = 'Instructions for resetting your password were sent to your email'; break;
    }

    return (
        <ModalCard showBorder>
            <FormInfo infoMessage={redirectMessage} />
            <LoginForm/>
            <hr/>
            <div className={styles.alternativeLoginOptionsContainer}>
                <div className={styles.socialLoginsContainer}>
                    <ElementOrLoader isLoading={dispatchersStatuses.oidcLogin === "loading"}>
                        <GoogleLoginButton align="center"
                                           size="2rem"
                                           onClick={() => oidcLogin('google')}/>
                        <GithubLoginButton align="center"
                                           size="2rem"
                                           onClick={() => oidcLogin('github')}/>
                    </ElementOrLoader>
                </div>
                <span>Or</span>
                <div className={styles.guestLoginContainer}>
                    <ElementOrLoader isLoading={isGuestLoginLoading}>
                        <GuestLoginButton onClick={logInAsGuest}/>
                    </ElementOrLoader>
                </div>
            </div>
            <FormError error={guestLogInError} />
            <AuthFormNavigator>
                <Link className={globalStyles.navLink} to="/register">Not registered yet?</Link>
                <Link className={globalStyles.navLink} to="/forgot-password">Forgot password?</Link>
            </AuthFormNavigator>
        </ModalCard>
    );
}