import { Link } from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm";
import { useGuestLogin } from "../../hooks/useGuestLogin";

export default function LoginPage() {
    const { errors, loginAsGuest } = useGuestLogin();

    function refresh() {
        fetch('http://localhost:8000/refresh', {
            method: "POST",
            credentials: "include"
        }).then();
    }

    return (
        <div>
            <LoginForm />
            {
                errors.length === 0 ?
                    <button onClick={() => loginAsGuest().then()}>Continue as guest</button>
                    : errors.map((error, index) => {
                        return <p key={index}>{error}</p>
                    })
            } 
            <Link to="/register">Not registered yet?</Link>
            <button onClick={refresh}>Refresh</button>
        </div>
    );
}