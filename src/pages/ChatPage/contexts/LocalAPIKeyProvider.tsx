import React from "react";
import { useSignalState } from "../../../hooks/useSignalState.ts";
import { Signal } from "@preact/signals-react";

type LocalAPIKeyContextValueType = [
    Signal<string>,
    (value: string) => void
] | null;

export const LocalAPIKeyContext = React.createContext<LocalAPIKeyContextValueType>(null);

export function LocalAPIKeyProvider({ children }: { children: React.ReactElement }) {
    const [localApiKey, setLocalApiKey] = useSignalState("");
    return (
        <LocalAPIKeyContext.Provider value={[localApiKey, setLocalApiKey]}>
            {children}
        </LocalAPIKeyContext.Provider>
    );
}