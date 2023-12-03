import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { useSignal } from "@preact/signals-react";


export function RequireAuth() {
    const { authState } = useAuth();
    const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
    const [allowRender, setAllowRender] = useState<boolean>(false);

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }
        setAllowRender(true);
    }, [authState.isAuthenticated]);

    return (
        allowRender ? (authState.isAuthenticated ? <Outlet /> : <Navigate to="/login" />) : null
    );
}
