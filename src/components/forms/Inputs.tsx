import React from "react";

export function EmailInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "username",
        type: "email",
        placeholder: "Enter your email",
        autoComplete: "username",
        required: true
    }
    const inputProps = {...defaultAttributes, ...props};
    return (
        <input {...inputProps} />
    );
}

export function PasswordInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "password",
        type: "password",
        autoComplete: "current-password",
        placeholder: "Enter your password",
        required: true
    }
    const inputProps = {...defaultAttributes, ...props};
    return (
        <input {...inputProps} />
    );
}

export function RepeatPasswordInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "reppassword",
        placeholder: "Repeat your password"
    };
    const inputProps = {...defaultAttributes, ...props}
    return (
        <PasswordInput {...inputProps} />
    );
}

export function NewPasswordInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        autoComplete: "new-password",
    };
    const inputProps = {...defaultAttributes, ...props}
    return (
        <PasswordInput {...inputProps} />
    );
}

