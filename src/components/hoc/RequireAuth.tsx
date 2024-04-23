import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../../hooks/contextHooks.ts";
import React from "react";
import {Spinner} from "../ui/Loaders/Spinner/Spinner.tsx";


export function RequireAuth({children} : {children?: React.ReactNode}) {
    const { isAuthenticated, authState } = useAuth();
    const renderedComponent = children || <Outlet />;
    return (
        authState.loginVerified ?
            (isAuthenticated ? renderedComponent : <Navigate to="/login" />) :
            <div style={{width: "100dvw", height: "100dvh"}}><Spinner /></div>
    );
}

export function RequireNoAuth({children} : {children?: React.ReactNode}) {
    const { isAuthenticated, authState } = useAuth();
    const renderedComponent = children || <Outlet />;
    return (
        authState.loginVerified ?
            (isAuthenticated ? <Navigate to="/"/> : renderedComponent) :
            <div style={{width: "100dvw", height: "100dvh"}}><Spinner/></div>
)
    ;
}