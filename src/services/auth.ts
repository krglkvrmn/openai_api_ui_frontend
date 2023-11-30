import { UUID } from "crypto";

export type SignupFormDataType = {
    email: string,
    password: string
}

export type LoginFormDataType = {
    username: string,
    password: string
};

export type UserSchema = {
    id: UUID,
    email: string,
    is_active: boolean,
    is_superuser: boolean,
    is_verified: boolean
};

export type RequestDetails = {
    detail?: string
};

export type SignupResponse = UserSchema & RequestDetails;
export type LoginResponse = RequestDetails;

export async function signup(formData: SignupFormDataType): Promise<SignupResponse> {
    return fetch('http://localhost:8000/auth/register', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    }).then(response => response.json());
}

export async function login(formData: LoginFormDataType): Promise<LoginResponse> {
    return fetch('http://localhost:8000/auth/jwt/login', {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(formData)
    }).then(response => {
        if (response.status >= 300) {
            return response.json();
        }
        return {};
    });
}