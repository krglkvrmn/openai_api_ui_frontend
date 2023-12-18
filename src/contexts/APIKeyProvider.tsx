import React from "react";
import { useSignalState } from "../hooks/useSignalState";
import { Signal } from "@preact/signals-react";

type APIKeyContextValueType = [
    Signal<string>,
    (value: string) => void
] | null;

export const APIKeyContext = React.createContext<APIKeyContextValueType>(null);

export function APIKeyProvider({ children }: { children: React.ReactElement }) {
    const [apiKey, setApiKey] = useSignalState("");
    return (
        <APIKeyContext.Provider value={[apiKey, setApiKey]}>
            {children}
        </APIKeyContext.Provider>
    );
}