import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SignupForm, useSignupForm } from "../../components/forms/SignupForm";


export default function RegisterPage() {
    return (
        <div>
            <SignupForm />
            <Link to="/login">To login page</Link>
        </div>
    );
}