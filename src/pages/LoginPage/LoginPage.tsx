import { Link } from "react-router-dom";
import { LoginForm } from "../../components/forms/LoginForm";

export default function LoginPage() {
    return (
        <div>
            <LoginForm />
            <Link to="/register">No registered yet?</Link>
        </div>
    );
}