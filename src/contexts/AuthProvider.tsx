import React, {useEffect, useState} from "react";
import {useMutation, useQuery} from 'react-query';
import {
    getCurrentUser,
    getOIDCAuthorizationURL,
    login,
    LoginFormDataType,
    LoginResponse,
    logout,
    OIDCProviderType,
    refresh, requestEmailVerification, requestPasswordReset, resetPassword,
    ResponseDetails,
    signup,
    SignupFormDataType,
    SignupResponse, verifyEmail, VerifyResponse
} from "../services/auth";
import {
    parseLogInError,
    parseLogOutError,
    parsePasswordResetError,
    parseSignUpError,
    parseVerificationError
} from "../utils/errorsParsers";
import {useLocation} from "react-router-dom";
import {queryClient} from "../queryClient.ts";


type AuthProviderUserSchema = {
    email: string,
    username: string,
    is_verified?: boolean
};

type AuthStateType = {
    loginVerified: boolean,
    isRefreshing: boolean,
    user?: AuthProviderUserSchema
};

type AuthContextValue = {
    isAuthenticated: boolean,
    authState: AuthStateType,
    logInError: string | null,
    logOutError: string | null,
    signUpError: string | null,
    verificationError: string | null,
    passwordResetError: string | null,
    authDispatchers: {
        logIn: (formData: LoginFormDataType) => Promise<LoginResponse>,
        logOut: () => Promise<ResponseDetails>,
        signUp: (formData: SignupFormDataType) => Promise<SignupResponse>,
        oidcLogin: (oidcProvider: OIDCProviderType) => Promise<void>,
        requestVerification: () => Promise<void>,
        verify: (token: string) => Promise<VerifyResponse>,
        requestPasswordReset: (email: string) => Promise<ResponseDetails>,
        resetPassword: ({token, password}: {token: string, password: string}) => Promise<ResponseDetails>
    }
} | null;



export const AuthContext = React.createContext<AuthContextValue>(null);

export function AuthProvider({ children }: {children: React.ReactElement}) {
    const location = useLocation();
    const [logInError, setLogInError] = useState<string | null>(null);
    const [logOutError, setLogOutError] = useState<string | null>(null);
    const [signUpError, setSignUpError] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const { data, isFetched } = useQuery({
        queryKey: ["authData"],
        queryFn: getCurrentUser,
        retry: false,
        refetchInterval: 30000,
        onSuccess: () => setIsAuthenticated(true),
        onError: () => ['/login', '/register'].includes(location.pathname) || refreshMutation.mutate()
    });

    const logInMutation = useMutation({
        mutationFn: login,
        onSuccess: async () => {
            setLogInError(null);
            await queryClient.invalidateQueries('authData');
        },
        onError: error => setLogInError(parseLogInError(error))
    });

    const logOutMutation = useMutation({
        mutationFn: logout,
        onSuccess: async () => {
            setLogOutError(null);
            await queryClient.invalidateQueries('authData')
        },
        onError: error => setLogOutError(parseLogOutError(error))
    });

    const signUpMutation = useMutation({
        mutationFn: signup,
        onSuccess: () => setSignUpError(null),
        onError: error => setSignUpError(parseSignUpError(error)),
    });

    const refreshMutation = useMutation({
        mutationFn: refresh,
        onError: () => setIsAuthenticated(false),
        onSuccess: async () => await queryClient.invalidateQueries('authData'),
    });

    async function oidcLogin(oidcProvider: OIDCProviderType): Promise<void> {
        window.location.href = await getOIDCAuthorizationURL(oidcProvider);
    }

    const oidcLoginMutation = useMutation({
        mutationFn: oidcLogin,
        onSuccess: async () => {
            await queryClient.invalidateQueries('authData');
            setLogInError(null);
            setSignUpError(null);
        }
    });

    async function requestVerification(): Promise<void> {
        const email = data?.email;
        if (email === undefined) {
            setVerificationError('You are not logged in!');
        } else {
            await requestEmailVerification(email);
            setVerificationError(null);
        }
    }

    const verificationMutation = useMutation({
        mutationFn: verifyEmail,
        onSuccess: () => setVerificationError(null),
        onError: error => setVerificationError(parseVerificationError(error)),
        onSettled: async () => await queryClient.invalidateQueries('authData')
    });

    const resetPasswordMutation = useMutation({
        mutationFn: resetPassword,
        onSuccess: () => setPasswordResetError(null),
        onError: error => setPasswordResetError(parsePasswordResetError(error)),
        onSettled: async () => await queryClient.invalidateQueries('authData')
    });

    // Do not persist error information between different routes
    useEffect(() => {
        setLogInError(null);
        setSignUpError(null);
        setVerificationError(null);
        setPasswordResetError(null);
        setLogOutError(null);
    }, [location.pathname]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            authState: {
                loginVerified: isFetched,
                isRefreshing: refreshMutation.isLoading,
                user: data 
            },
            logInError, logOutError, signUpError, verificationError, passwordResetError,
            authDispatchers: {
                logIn: logInMutation.mutateAsync,
                logOut: logOutMutation.mutateAsync,
                signUp: signUpMutation.mutateAsync,
                oidcLogin: oidcLoginMutation.mutateAsync,
                requestVerification: requestVerification,
                verify: verificationMutation.mutateAsync,
                requestPasswordReset: requestPasswordReset,
                resetPassword: resetPasswordMutation.mutateAsync
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}
