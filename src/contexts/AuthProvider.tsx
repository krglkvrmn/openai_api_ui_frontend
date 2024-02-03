import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, UseMutateAsyncFunction } from 'react-query';
import { LoginFormDataType, LoginResponse, ResponseDetails, SignupFormDataType, SignupResponse, UserSchema, getCurrentUser, login, logout, refresh, signup } from "../services/auth";
import { UserErrors } from "../types";
import { queryClient } from "../App";
import { error } from "console";
import { parseLogInError, parseLogOutError, parseSignUpError } from "../utils/errorsParsers";
import { UNSAFE_DataRouterContext, useLocation } from "react-router-dom";


type AuthProviderUserSchema = {
    email: string,
    username: string,
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
    authDispatchers: {
        logIn: (formData: LoginFormDataType) => Promise<LoginResponse>,
        logOut: () => Promise<ResponseDetails>,
        signUp: (formData: SignupFormDataType) => Promise<SignupResponse>,
    }
} | null;



export const AuthContext = React.createContext<AuthContextValue>(null);

export function AuthProvider({ children }: {children: React.ReactElement}) {
    const location = useLocation();
    const [logInError, setLogInError] = useState<string | null>(null);
    const [logOutError, setLogOutError] = useState<string | null>(null);
    const [signUpError, setSignUpError] = useState<string | null>(null);
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
        onSuccess: () => queryClient.invalidateQueries('authData'),
        onError: error => setLogInError(parseLogInError(error))
    });

    const logOutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => queryClient.invalidateQueries('authData'),
        onError: error => setLogOutError(parseLogOutError(error))
    });

    const signUpMutation = useMutation({
        mutationFn: signup,
        onError: error => setSignUpError(parseSignUpError(error))
    });

    const refreshMutation = useMutation({
        mutationFn: refresh,
        onError: () => setIsAuthenticated(false),
        onSuccess: () => queryClient.invalidateQueries('authData'),
    });

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            authState: {
                loginVerified: isFetched,
                isRefreshing: refreshMutation.isLoading,
                user: data 
            },
            logInError, logOutError, signUpError,
            authDispatchers: {
                logIn: logInMutation.mutateAsync,
                logOut: logOutMutation.mutateAsync,
                signUp: signUpMutation.mutateAsync
            }
        }}>
            {children}
        </AuthContext.Provider>
    );
}
