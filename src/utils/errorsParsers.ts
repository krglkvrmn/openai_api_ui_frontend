import axios from "axios";
import { AxiosError } from "axios";
import { ResponseDetails } from "../services/auth";

export type AuthErrors = {
    logInError: string | null,
    logOutError: string | null,
    signUpError: string | null,
}

export function parseLogInError(logInError: AxiosError<ResponseDetails> | unknown): string | null {
    if (axios.isAxiosError(logInError)) {
        if (logInError.response?.data?.detail === "LOGIN_BAD_CREDENTIALS") {
            return "Incorrect Email or password";
        } else if (logInError.response?.status === 422) {
            return "Invalid username of password format"
        } else {
            return "Unknown login error";
        }
    }
    return logInError ? "Unknown error" : null;
}

export function parseLogOutError(logOutError: AxiosError<ResponseDetails> | unknown): string | null {
    if (axios.isAxiosError(logOutError)) {
        if (logOutError.response?.status === 401) {
            return "You are already logged out";
        } else {
            return "Unknown logout error";
        }
    }
    return logOutError ? "Unknown error" : null;
}

export function parseSignUpError(signUpError: AxiosError<ResponseDetails> | unknown): string | null {
    if (axios.isAxiosError(signUpError)) {
        if (signUpError.response?.status === 400 && signUpError.response?.data.detail === "REGISTER_USER_ALREADY_EXISTS") {
            return "User with this email already exists";
        } else if (signUpError.response?.status === 422) {
            return "Invalid Email of password format"
        } else {
            return "Unknown sign up error";
        }
    }
    return signUpError ? "Unknown error" : null;
}