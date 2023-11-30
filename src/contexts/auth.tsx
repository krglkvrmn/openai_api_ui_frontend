import React, { useContext, useState } from "react";


type AuthProviderUserSchema = {
    email: string
} | null;

type AuthContextValue = [
    user: AuthProviderUserSchema,
    signIn: (user: AuthProviderUserSchema) => void,
    signOut: () => void
] | null;

const AuthContext = React.createContext<AuthContextValue>(null);

export function AuthProvider({ children }: {children: React.ReactElement}) {
    const [user, setUser] = useState<AuthProviderUserSchema>(null);

    function signIn(user: AuthProviderUserSchema) {
        setUser(user);
    }
    function signOut() {
        setUser(null);
    }
    return (
        <AuthContext.Provider value={[user, signIn, signOut]}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('Auth provider value is not set')
    }
    return context;
}