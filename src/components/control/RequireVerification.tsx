import {useAuth} from "../../hooks/contextHooks.ts";
import {Navigate, Outlet} from "react-router-dom";
import React from "react";

export function RequireVerification({children} : {children?: React.ReactNode}) {
    const { authState } = useAuth();
    const isUserVerified = authState.user?.is_verified;
    const renderedComponent = children || <Outlet />;
    return (
        isUserVerified ? renderedComponent : <Navigate to="/verification" state="forbidden_page" />
    );
}

export function RequireNoVerification({children} : {children?: React.ReactNode}) {
    const { authState } = useAuth();
    const isUserVerified = authState.user?.is_verified;
    const renderedComponent = children || <Outlet />;
    return (
        !isUserVerified ? renderedComponent : <Navigate to="/" />
    );
}
