import { Link } from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm";
import { useGuestLogin } from "../../hooks/useGuestLogin";
import {useAuth} from "../../hooks/contextHooks.ts";

export default function LoginPage() {
    const { error, loginAsGuest } = useGuestLogin();
    const { authDispatchers } = useAuth();
    const { oidcLogin } = authDispatchers;

    function login() {
        loginAsGuest().then(() => {
            console.log('Successfully logged in as a guest')}
        ).catch(error => {
            console.error('An error occurred while logging as a guest:', error)
        })
    }

    return (
        <div>
            <LoginForm/>
            <button onClick={login}>Continue as guest</button>
            <button onClick={() => oidcLogin('google')}>Log in with google</button>
            <button onClick={() => oidcLogin('github')}>Log in with github</button>
            {error}

            <Link to="/register">Not registered yet?</Link>
        </div>
    );
}