import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/contextHooks";


export function RequireAuth() {
    const { isAuthenticated, authState } = useAuth();

    return (
        authState.loginVerified ?
            (isAuthenticated ? <Outlet /> : <Navigate to="/login" />) : null
    );
}

export function RequireNoAuth() {
    const { isAuthenticated, authState } = useAuth();

    return (
        authState.loginVerified ?
            (isAuthenticated && !authState.isRefreshing ? <Navigate to="/" /> : <Outlet />) : null
    );
}