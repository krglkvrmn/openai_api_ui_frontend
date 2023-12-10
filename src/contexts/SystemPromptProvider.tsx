import React from "react";
import { useSignalState } from "../hooks/useSignalState";
import { Signal } from "@preact/signals-core";


type SystemPromptContextValueType = [
    Signal<string>,
    (value: string) => void
] | null;

export const SystemPromptContext = React.createContext<SystemPromptContextValueType>(null);

export function SystemPromptProvider({ children }: { children: React.ReactElement }) {
    const [systemPromptValue, setSystemPromptValue] = useSignalState<string>("");

    return (
        <SystemPromptContext.Provider value={[systemPromptValue, setSystemPromptValue]}>
            { children }
        </SystemPromptContext.Provider>
    )
}