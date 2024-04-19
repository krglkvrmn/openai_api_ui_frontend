import React from "react";
import styles from "./style.module.css";

export function EmailInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
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

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
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

export function RepeatPasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "reppassword",
        placeholder: "Repeat password"
    };
    const inputProps = {...defaultAttributes, ...props}
    return (
        <PasswordInput className={styles.stringFormInput} {...inputProps} />
    );
}

export function NewPasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        autoComplete: "new-password",
    };
    const inputProps = {...defaultAttributes, ...props}
    return (
        <PasswordInput className={styles.stringFormInput} {...inputProps} />
    );
}

export function APIKeyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const defaultAttributes = {
        name: "api_key",
        type: "password",
        placeholder: "Enter your OpenAI API key here",
        autoComplete: 'off',
        required: true
    }
    const inputProps = {...defaultAttributes, ...props};
    return (
        <input className={styles.apiKeyInput} {...inputProps} />
    );
}