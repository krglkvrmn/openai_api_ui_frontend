import { Link } from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm";
import { useGuestLogin } from "../../hooks/useGuestLogin";

export default function LoginPage() {
    const { error, loginAsGuest } = useGuestLogin();

    function login() {
        loginAsGuest().then(() => {
            console.log('Successfully logged in as a guest')}
        ).catch(error => {
            console.error('An error occured while logging as a guest:', error)
        })
    }

    return (
        <div>
            <LoginForm />
            <button onClick={login}>Continue as guest</button>
            {error}

            <Link to="/register">Not registered yet?</Link>
        </div>
    );
}