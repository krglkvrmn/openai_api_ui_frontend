import { AuthContext } from "../contexts/AuthProvider";

import { useContext } from "react";


export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('Auth provider value is not set');
    }
    return context;
}
