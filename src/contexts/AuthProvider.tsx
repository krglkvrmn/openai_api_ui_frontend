import React, { useEffect, useState } from "react";
import { LoginFormDataType, SignupFormDataType, UserSchema, getCurrentUser, login, logout, signup } from "../services/auth";
import { UserErrors } from "../types";


type AuthProviderUserSchema = {
    email: string,
} | null;

type AuthStateType = {
    isAuthenticated: boolean,
    user?: AuthProviderUserSchema
}

type AuthContextValue = {
    authState: AuthStateType,
    authDispatchers: {
        signIn: (formData: LoginFormDataType) => Promise<UserErrors>,
        signOut: () => Promise<UserErrors>,
        signUp: (formData: SignupFormDataType) => Promise<UserErrors>,
    }
} | null;

export const AuthContext = React.createContext<AuthContextValue>(null);

export function AuthProvider({ children }: {children: React.ReactElement}) {
    const [authState, setAuthState] = useState<AuthStateType>({isAuthenticated: false});

    useEffect(() => {
        if (!authState.isAuthenticated) {
            verifyUser().then();
        }
    }, []);

    async function signIn(formData: LoginFormDataType): Promise<UserErrors> {
        const errors: string[] = [];
        try {
            const loginInfo = await login(formData);
            if (loginInfo.detail === undefined) {
                console.log('Successfully logged in:', formData.username);
                verifyUser();
            } else if (loginInfo.detail === "LOGIN_BAD_CREDENTIALS") {
                errors.push("Incorrect email or password");
            } else {
                errors.push("An error occured during login");
            }
        } catch (error) {
            console.error(error);
            errors.push("An error occured during login");
        }
        return errors;
    }

    async function signOut(): Promise<UserErrors> {
        const errors: string[] = [];
        try {
            const logoutInfo = await logout();
            if (logoutInfo.detail === undefined) {
                console.log('Successfully logged out');
                setAuthState({isAuthenticated: false});
            } else if (logoutInfo.detail === "Unauthorized") {
                errors.push("You are already logged out");
            } else {
                errors.push("An error occured during logging out");
            }
        } catch (error) {
            console.error(error);
            errors.push("An error occured during logging out");
        }
        return errors;
    }

    async function signUp(formData: SignupFormDataType): Promise<UserErrors> {
        const errors: string[] = [];
        try {
            const signupInfo = await signup(formData);
            console.log(signupInfo);
            if (signupInfo.detail === undefined && signupInfo.email !== undefined) {
                console.log('Successfully registered:', signupInfo);
            } else if (signupInfo.detail === "REGISTER_USER_ALREADY_EXISTS") {
                errors.push("User already exists");
            } else {
                errors.push("An error occured during registration");
            }
        } catch (error) {
            console.error(error);
            errors.push("An error occured during registration");
        }
        return errors;
    }

    async function verifyUser(): Promise<UserErrors> {
        const errors: string[] = [];
        try {
            const userInfo = await getCurrentUser();
            if (userInfo.detail === undefined) {
                console.log('Successfully fetched user info:', userInfo);
                setAuthState({isAuthenticated: true, user: userInfo});
            } else if (userInfo.detail == "Unauthorized") {
                errors.push('You must be authorized to fetch user information');
            } else {
                errors.push("An error occured during fetching user");
            }
        } catch (error) {
            console.error(error);
            errors.push("An error occured during fetching user");
        }
        if (errors.length > 0) {
            setAuthState({isAuthenticated: false})
        }
        return errors;

    }
    return (
        <AuthContext.Provider value={{authState, authDispatchers: {signIn, signOut, signUp}}}>
            {children}
        </AuthContext.Provider>
    );
}
