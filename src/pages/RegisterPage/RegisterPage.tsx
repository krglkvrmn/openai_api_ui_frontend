import { useRef, useState } from "react";
import { Link } from "react-router-dom";

type TuseSignupFormReturn = [
    React.RefObject<HTMLInputElement>,
    React.RefObject<HTMLInputElement>,
    React.RefObject<HTMLInputElement>,
    string | null,
    () => void
]

type SignupFormDataType = {
    valid: boolean,
    data?: {
        email: string | undefined,
        password: string | undefined
    }
}

function useSignupForm(): TuseSignupFormReturn {
    const [error, setError] = useState<string | null>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const repeatPasswordRef = useRef<HTMLInputElement>(null);

    function validateForm() {
        const formData: SignupFormDataType = {valid: true}
        const email = emailRef.current === null ? "" : emailRef.current.value;
        const password = passwordRef.current === null ? "" : passwordRef.current.value;
        const repeatedPassword = repeatPasswordRef.current === null ? "" : repeatPasswordRef.current.value;

        if (email === "" || password === "" || repeatedPassword === "") {
            setError("Some fields are missing!");
            formData.valid = false;
        } else if (password !== repeatedPassword) {
            setError("Passwords do not match!");
            formData.valid = false;
        } else if (password.length < 8) {
            setError("Password must contain at least 8 symbols!")
            formData.valid = false;
        }
        if (formData.valid) {
            formData.data = {email: email, password: password}
        }
        return formData;

    }

    function signup() {
        const {valid: formValid, data: formData} = validateForm();
        if (formValid) {
            fetch('http://localhost:8000/auth/register', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        })
        }
        
    }

    return [emailRef, passwordRef, repeatPasswordRef, error, signup]
}

export default function RegisterPage() {
    const [emailRef, passwordRef, repeatPasswordRef, error, signup] = useSignupForm();
    console.log(error);
    return (
        <div>
            {error}
            <form>
                <label htmlFor="signup-email-input">Email:</label>
                <input id="signup-email-input" type="email" placeholder="Enter your email" ref={emailRef} required />
                <br/>
                <label htmlFor="signup-password-input">Password:</label>
                <input id="signup-password-input" type="password" placeholder="Enter your password" ref={passwordRef} required />
                <br/>
                <label htmlFor="signup-rep-password-input">Repeat password:</label>
                <input id="signup-rep-password-input" type="password" placeholder="Repeat your password" ref={repeatPasswordRef} required />
                <br />
                <button type="submit" onClick={e => {e.preventDefault(); signup()}}>Sign Up</button>
            </form>
            <Link to="/login">To login page</Link>
        </div>
    );
}