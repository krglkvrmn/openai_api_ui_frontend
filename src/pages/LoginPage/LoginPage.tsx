import {Link, useLocation} from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm/LoginForm.tsx";
import {useAuth} from "../../hooks/contextHooks.ts";
import "./style.css";
import {GithubLoginButton, GoogleLoginButton} from "react-social-login-buttons";
import FormError from "../../components/ui/InfoPanels/Error.tsx";
import {FormInfo} from "../../components/ui/InfoPanels/Info.tsx";
import {GuestLoginButton} from "../../components/forms/Elements/Buttons.tsx";
import {ModalCard} from "../../components/ui/Layout/ModalCard/ModalCard.tsx";

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
        <ModalCard>
            <FormInfo infoMessage={redirectMessage} />
            <LoginForm/>
            <hr/>
            <div className="alternative-login-options-container">
                <div className="social-logins-container">
                    <GoogleLoginButton className="social-login-button"
                                       size="2rem"
                                       onClick={() => oidcLogin('google')}/>
                    <GithubLoginButton className="social-login-button"
                                       size="2rem"
                                       onClick={() => oidcLogin('github')}/>
                </div>
                <div className="guest-login-container">
                    <span>Or</span>
                    <GuestLoginButton replaceWithLoader={isGuestLoginLoading} onClick={logInAsGuest} />
                </div>
            </div>
            <FormError error={guestLogInError} />
            <div className="unable-to-login-container">
                <Link className="unable-to-login-action-link" to="/register">Not registered yet?</Link>
                <Link className="unable-to-login-action-link" to="/forgot-password">Forgot password?</Link>
            </div>
        </ModalCard>
    );
}