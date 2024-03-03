import {UUID} from "crypto";
import axios, {AxiosResponse} from "axios";
import {BACKEND_ORIGIN} from "../configuration/config.ts";

export type SignupFormDataType = {
    email: string,
    password: string,
    is_guest?: boolean
}

export type LoginFormDataType = {
    username: string,
    password: string
}

export type UserSchema = {
    id?: UUID,
    email: string,
    username: string,
    is_active?: boolean,
    is_superuser?: boolean,
    is_verified?: boolean,
    is_guest?: boolean
};

export type ResponseDetails = {
    detail?: string
};

export type SignupResponse = UserSchema & ResponseDetails;
export type LoginResponse = ResponseDetails;
export type LogoutResponse = ResponseDetails;

export type OIDCRequestAuthorizationResponse = {
    authorization_url: string
}
export type OIDCProviderType = 'google' | 'github';


export async function signup(formData: SignupFormDataType): Promise<SignupResponse> {
    const response = await axios.post(BACKEND_ORIGIN + '/auth/register', formData, {
        headers: {'Content-Type': 'application/json'},
        withCredentials: true
    })
    return response.data;
}

export async function login(formData: LoginFormDataType): Promise<LoginResponse> {
    const response = await axios.post(
        BACKEND_ORIGIN + '/auth/jwt/login', formData, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            withCredentials: true
        },
    )
    return response.data;
}

export async function logout(): Promise<LogoutResponse> {
    const response = await axios.post(BACKEND_ORIGIN + '/auth/jwt/logout', {}, {withCredentials: true});
    return response.data;
}

export async function refresh(): Promise<undefined> {
    const response = await axios.post(BACKEND_ORIGIN + '/refresh', {}, {withCredentials: true});
    return response.data;
}

export async function getCurrentUser(): Promise<UserSchema> {
    const response = await axios.get(BACKEND_ORIGIN + '/users/me', {withCredentials: true});
    return {...response.data, username: response.data.email.split('@')[0]};
}

export async function getOIDCAuthorizationURL(oidcProvider: OIDCProviderType): Promise<string> {
    const response: AxiosResponse<OIDCRequestAuthorizationResponse> = await axios.get(
        BACKEND_ORIGIN + `/auth/${oidcProvider}/authorize`,
        { withCredentials: true }
    );
    return response.data.authorization_url;
}

export async function refreshRetryOnUnauthorized(
    requestGenerator: () => Promise<AxiosResponse>
) {
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
    }
}