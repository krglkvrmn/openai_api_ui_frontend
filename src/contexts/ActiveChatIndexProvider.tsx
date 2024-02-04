import React, { useState } from "react";


type ActiveChatIndexContextValueType = [
    activeChatIndex: number | null,
    setActiveChatIndex: React.Dispatch<React.SetStateAction<number | null>>
] | null;

export const ActiveChatIndexContext = React.createContext<ActiveChatIndexContextValueType>(null);

export function ActiveChatIndexProvider({ children }: {children: React.ReactElement}) {
    const [activeChatIndex, setActiveChatIndex] = useState<number | null>(null); 
    return (
        <ActiveChatIndexContext.Provider value={[activeChatIndex, setActiveChatIndex]}>
            {children}
        </ActiveChatIndexContext.Provider>
    );
}