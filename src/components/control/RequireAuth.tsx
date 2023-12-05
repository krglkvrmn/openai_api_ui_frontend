import { Navigate, Outlet, redirect, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { useSignal } from "@preact/signals-react";


export function RequireAuth() {
    const { isAuthenticated, authState } = useAuth();

    return (
        authState.loginVerified ? (isAuthenticated ? <Outlet /> : <Navigate to="/login" />) : null
    );
}

export function RequireNoAuth() {
    const { isAuthenticated, authState } = useAuth();

    return (
        authState.loginVerified ? (isAuthenticated ? <Navigate to="/" /> : <Outlet />) : null
    );
}