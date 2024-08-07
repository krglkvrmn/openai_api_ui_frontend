import {UUID} from "crypto";
import axios, {AxiosResponse} from "axios";
import {BACKEND_ORIGIN} from "../configuration/config.ts";

import {castStringsToDates} from "../utils/stringparsers.ts";

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
    is_guest?: boolean,
    datetime_registered: Date,
    lifetime: number | null
};

export type ResponseDetails = {
    detail?: string
};

export type SignupResponse = UserSchema & ResponseDetails;
export type LoginResponse = ResponseDetails;
export type LogoutResponse = ResponseDetails;
export type VerifyResponse = {
    email: string,
    is_guest: boolean,
    is_verified: boolean
} & ResponseDetails;

export type OIDCRequestAuthorizationResponse = {
    authorization_url: string
}
export type OIDCProviderType = 'google' | 'github';


export async function signup(formData: SignupFormDataType): Promise<SignupResponse> {
    const response = await axios.post(BACKEND_ORIGIN + '/auth/register', formData, {
        headers: {'Content-Type': 'application/json'},
        withCredentials: true
    })
    return castStringsToDates(response.data) as SignupResponse;
}

export async function login(formData: LoginFormDataType): Promise<LoginResponse> {
    const response = await axios.post(
        BACKEND_ORIGIN + '/auth/jwt/login', formData, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            withCredentials: true
        },
    )
    return castStringsToDates(response.data) as LoginResponse;
}

export async function logout(): Promise<LogoutResponse> {
    const response = await axios.post(BACKEND_ORIGIN + '/auth/jwt/logout', {}, {withCredentials: true});
    return castStringsToDates(response.data) as LogoutResponse;
}

export async function refresh(): Promise<undefined> {
    const response = await axios.post(BACKEND_ORIGIN + '/refresh', {}, {withCredentials: true});
    return response.data;
}

export async function getCurrentUser(): Promise<UserSchema> {
    const requestGenerator = () =>
        axios.get(BACKEND_ORIGIN + '/users/me', { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return {
        ...response.data,
        username: response.data.email.split('@')[0],
        datetime_registered: new Date(response.data.datetime_registered + 'Z')
    };
}

export async function getOIDCAuthorizationURL(oidcProvider: OIDCProviderType): Promise<string> {
    const response: AxiosResponse<OIDCRequestAuthorizationResponse> = await axios.get(
        BACKEND_ORIGIN + `/auth/${oidcProvider}/authorize`,
        { withCredentials: true }
    );
    return response.data.authorization_url;
}

export async function requestEmailVerification(email: string): Promise<ResponseDetails> {
    const requestGenerator = () =>
        axios.post(BACKEND_ORIGIN + '/auth/request-verify-token', { email }, { withCredentials: true });
    return await refreshRetryOnUnauthorized(requestGenerator) as ResponseDetails;
}

export async function verifyEmail(token: string): Promise<VerifyResponse> {
    const requestGenerator = () =>
        axios.post(BACKEND_ORIGIN + '/auth/verify', { token }, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return castStringsToDates(response.data) as VerifyResponse;
}

export async function requestPasswordReset(email: string): Promise<ResponseDetails> {
    const response = await axios.post(
        BACKEND_ORIGIN + '/auth/forgot-password', { email }, { withCredentials: true }
    );
    return castStringsToDates(response.data) as ResponseDetails;
}

export async function resetPassword({token, password}: {token: string, password: string}): Promise<ResponseDetails> {
    const response = await axios.post(
        BACKEND_ORIGIN + '/auth/reset-password', { token, password }, { withCredentials: true }
    );
    return castStringsToDates(response.data) as ResponseDetails;
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