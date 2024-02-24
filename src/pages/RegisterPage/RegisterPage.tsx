import {Link} from "react-router-dom";
import {SignupForm} from "../../components/forms/SignupForm";


export default function RegisterPage() {
    return (
        <div>
            <SignupForm />
            <Link to="/login">To login page</Link>
        </div>
    );
}