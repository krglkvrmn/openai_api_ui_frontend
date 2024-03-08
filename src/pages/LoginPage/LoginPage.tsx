import {Link, useLocation} from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm";
import { useGuestLogin } from "../../hooks/useGuestLogin";
import {useAuth} from "../../hooks/contextHooks.ts";

export default function LoginPage() {
    const location = useLocation();
    const { error, loginAsGuest } = useGuestLogin();
    const { authDispatchers } = useAuth();
    const { oidcLogin } = authDispatchers;

    let redirectMessage: string | undefined = undefined;
    const state = location.state;
    switch (state) {
        case 'password-reset-request':
            redirectMessage = 'A link to reset your password was sent to your email'; break;
    }

    return (
        <div>
            {redirectMessage}
            <LoginForm/>
            <button onClick={loginAsGuest}>Continue as guest</button>
            <button onClick={() => oidcLogin('google')}>Log in with google</button>
            <button onClick={() => oidcLogin('github')}>Log in with github</button>
            {error}

            <Link to="/register">Not registered yet?</Link>
            <Link to="/forgot-password">Forgot password?</Link>
        </div>
    );
}