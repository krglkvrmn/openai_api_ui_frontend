import { UUID } from "crypto";
import axios, { AxiosError, AxiosResponse } from "axios";

export type SignupFormDataType = {
    email: string,
    password: string,
    is_guest?: boolean
}

export type LoginFormDataType = {
    username: string,
    password: string
};

export type UserSchema = {
    id?: UUID,
    email: string,
    is_active?: boolean,
    is_superuser?: boolean,
    is_verified?: boolean
};

export type ResponseDetails = {
    detail?: string
};

export type SignupResponse = UserSchema & ResponseDetails;
export type LoginResponse = ResponseDetails;
export type LogoutResponse = ResponseDetails;


export async function signup(formData: SignupFormDataType): Promise<SignupResponse> {
    const response = await axios.post('http://localhost:8000/auth/register', formData, {
        headers: {'Content-Type': 'application/json'},
        withCredentials: true
    })
    return response.data;
}

export async function login(formData: LoginFormDataType): Promise<LoginResponse> {
    const response = await axios.post(
        'http://localhost:8000/auth/jwt/login', formData, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            withCredentials: true
        },
    )
    return response.data;
}

export async function logout(): Promise<LogoutResponse> {
    const response = await axios.post('http://localhost:8000/auth/jwt/logout', {}, {withCredentials: true});
    return response.data;
}

export async function refresh(): Promise<undefined> {
    const response = await axios.post('http://localhost:8000/refresh', {}, {withCredentials: true});
    return response.data;
}

export async function getCurrentUser(): Promise<UserSchema> {
    const response = await axios.get('http://localhost:8000/users/me', {withCredentials: true});
    return response.data;
}

export async function refreshRetryOnUnauthorized(requestGenerator: () => Promise<AxiosResponse>) {
    try {
        return await requestGenerator();
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                await refresh();
                return await requestGenerator();
            }
        }
        throw error;

    };
}