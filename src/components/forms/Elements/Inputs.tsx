import React from "react";
import styles from "./style.module.css";

export function EmailInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "username",
        type: "email",
        placeholder: "Email",
        autoComplete: "username",
        required: true
    }
    const inputProps = {...defaultAttributes, ...props};
    return (
        <input className={styles.stringFormInput} {...inputProps} />
    );
}

export function PasswordInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "password",
        type: "password",
        autoComplete: "current-password",
        placeholder: "Password",
        required: true
    }
    const inputProps = {...defaultAttributes, ...props};
    return (
        <input className={styles.stringFormInput} {...inputProps} />
    );
}

export function RepeatPasswordInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "reppassword",
        placeholder: "Repeat password"
    };
    const inputProps = {...defaultAttributes, ...props}
    return (
        <PasswordInput className={styles.stringFormInput} {...inputProps} />
    );
}

export function NewPasswordInput({...props}: React.HTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        autoComplete: "new-password",
    };
    const inputProps = {...defaultAttributes, ...props}
    return (
        <PasswordInput className={styles.stringFormInput} {...inputProps} />
    );
}
