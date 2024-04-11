import React, {useState} from "react";


type SystemPromptContextValueType = [
    string,
    (value: string) => void
] | null;


export const SystemPromptContext = React.createContext<SystemPromptContextValueType>(null);

export function SystemPromptProvider({children}: {children: React.ReactNode}) {
    const [systemPromptValue, setSystemPromptValue] = useState("");
    return (
        <SystemPromptContext.Provider value={[systemPromptValue, setSystemPromptValue]}>
            {children}
        </SystemPromptContext.Provider>
    );
}
