import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/contextHooks.ts";
import React from "react";


export function RequireAuth({children} : {children?: React.ReactNode}) {
    const { isAuthenticated, authState } = useAuth();
    const renderedComponent = children || <Outlet />;
    return (
        authState.loginVerified ?
            (isAuthenticated ? renderedComponent : <Navigate to="/login" />) : null
    );
}

export function RequireNoAuth({children} : {children?: React.ReactNode}) {
    const { isAuthenticated, authState } = useAuth();
    const renderedComponent = children || <Outlet />;
    return (
        authState.loginVerified ?
            (isAuthenticated && !authState.isRefreshing ? <Navigate to="/" /> : renderedComponent) : null
    );
}