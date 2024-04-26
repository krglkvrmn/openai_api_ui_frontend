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
    refresh,
    requestEmailVerification,
    requestPasswordReset,
    resetPassword,
    ResponseDetails,
    signup,
    SignupFormDataType,
    SignupResponse,
    verifyEmail,
    VerifyResponse
} from "../services/auth";
import {
    parseLogInError,
    parseLogOutError, parseOidcLoginError,
    parsePasswordResetError, parseRequestPasswordResetError,
    parseSignUpError,
    parseVerificationError
} from "../utils/errorsParsers";
import {useLocation} from "react-router-dom";
import {queryClient} from "../queryClient.ts";
import {v4 as uuidv4} from "uuid";
import {generate} from "generate-password-browser";


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
    guestLogInError: string | null,
    logOutError: string | null,
    signUpError: string | null,
    verificationError: string | null,
    requestPasswordResetError: string | null,
    passwordResetError: string | null,
    oidcLoginError: string | null,
    authDispatchers: {
        logIn: (formData: LoginFormDataType) => Promise<LoginResponse>,
        logInAsGuest: () => Promise<void>,
        logOut: () => Promise<ResponseDetails>,
        signUp: (formData: SignupFormDataType) => Promise<SignupResponse>,
        oidcLogin: (oidcProvider: OIDCProviderType) => Promise<void>,
        requestVerification: () => Promise<void>,
        verify: (token: string) => Promise<VerifyResponse>,
        requestPasswordReset: (email: string) => Promise<ResponseDetails>,
        resetPassword: ({token, password}: {token: string, password: string}) => Promise<ResponseDetails>
    },
    dispatchersStatuses: {
        logIn: "success" | "error" | "idle" | "loading",
        loginAsGuest: "success" | "error" | "idle" | "loading",
        logOut: "success" | "error" | "idle" | "loading",
        signUp: "success" | "error" | "idle" | "loading",
        oidcLogin: "success" | "error" | "idle" | "loading",
        verify: "success" | "error" | "idle" | "loading",
        resetPassword: "success" | "error" | "idle" | "loading"
    }
} | null;



export const AuthContext = React.createContext<AuthContextValue>(null);


export function AuthProvider({ children }: {children: React.ReactElement}) {
    const location = useLocation();
    const [guestLogInError, setGuestLogInError] = useState<string | null>(null);
    const [logInError, setLogInError] = useState<string | null>(null);
    const [logOutError, setLogOutError] = useState<string | null>(null);
    const [signUpError, setSignUpError] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [requestPasswordResetError, setRequestPasswordResetError] = useState<string | null>(null);
    const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
    const [oidcLoginError, setOidcLoginError] = useState<string | null>(null);
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
        onMutate: () => setLogInError(null),
        onSuccess: async () => {
            await queryClient.invalidateQueries('authData');
        },
        onError: error => {
            // Guest login error and normal login error are mutually exclusive
            setLogInError(parseLogInError(error));
            setGuestLogInError(null);
        }
    });

    const logOutMutation = useMutation({
        mutationFn: logout,
        onMutate: () => setLogOutError(null),
        onSuccess: async () => {
            await queryClient.invalidateQueries('authData');
        },
        onError: error => setLogOutError(parseLogOutError(error))
    });

    const signUpMutation = useMutation({
        mutationFn: signup,
        onMutate: () => setSignUpError(null),
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
        onMutate: () => {
            setSignUpError(null);
            setLogInError(null);
            setOidcLoginError(null);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries('authData');
        },
        onError: async (error, variables) => {
            setOidcLoginError(parseOidcLoginError(error, variables));
        }
    });

    async function requestVerification(): Promise<void> {
        const email = data?.email;
        setVerificationError(null);
        if (email === undefined) {
            setVerificationError('You are not logged in!');
        } else {
            await requestEmailVerification(email);
        }
    }

    const verificationMutation = useMutation({
        mutationFn: verifyEmail,
        onMutate: () => setVerificationError(null),
        onError: error => setVerificationError(parseVerificationError(error)),
        onSettled: async () => await queryClient.invalidateQueries('authData')
    });

    const requestPasswordResetMutation = useMutation({
        mutationFn: requestPasswordReset,
        onMutate: () => setRequestPasswordResetError(null),
        onError: (error) => setRequestPasswordResetError(parseRequestPasswordResetError(error))
    });

    const resetPasswordMutation = useMutation({
        mutationFn: resetPassword,
        onMutate: () => setPasswordResetError(null),
        onError: error => setPasswordResetError(parsePasswordResetError(error)),
        onSettled: async () => await queryClient.invalidateQueries('authData')
    });

    function createGuestUserData(): [string, string] {
        const username = `Guest@${uuidv4()}.guest`;
        const password = generate({length: 30, numbers: true, symbols: true, uppercase: true, lowercase: true});
        return [username, password];
    }

    async function logInAsGuest(): Promise<void> {
        const [username, password] = createGuestUserData();
        setGuestLogInError(null);
        try {
            await signUpMutation.mutateAsync({email: username, password: password, is_guest: true});
            signUpMutation.reset();
            await logInMutation.mutateAsync({username, password});
            logInMutation.reset();
        } catch (error) {
            setGuestLogInError("An error occurred while logging as a guest");
            setLogInError(null);
        }
    }

    // Do not persist error information between different routes
    useEffect(() => {
        setLogInError(null);
        setGuestLogInError(null);
        setSignUpError(null);
        setVerificationError(null);
        setPasswordResetError(null);
        setLogOutError(null);
        setOidcLoginError(null);
    }, [location.pathname]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            authState: {
                loginVerified: isFetched,
                isRefreshing: refreshMutation.isLoading,
                user: data 
            },
            logInError, guestLogInError, logOutError, signUpError,
            verificationError, requestPasswordResetError, passwordResetError, oidcLoginError,
            authDispatchers: {
                logIn: logInMutation.mutateAsync,
                logInAsGuest,
                logOut: logOutMutation.mutateAsync,
                signUp: signUpMutation.mutateAsync,
                oidcLogin: oidcLoginMutation.mutateAsync,
                requestVerification: requestVerification,
                verify: verificationMutation.mutateAsync,
                requestPasswordReset: requestPasswordResetMutation.mutateAsync,
                resetPassword: resetPasswordMutation.mutateAsync
            },
            dispatchersStatuses: {
                logIn: logInMutation.status,
                loginAsGuest: signUpMutation.status === "success" ? logInMutation.status : signUpMutation.status,
                logOut: logOutMutation.status,
                signUp: signUpMutation.status,
                oidcLogin: oidcLoginMutation.status,
                verify: verificationMutation.status,
                resetPassword: resetPasswordMutation.status
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}
