import React, { useState } from "react";


type ActiveChatIdContextValueType = [
    activeChatId: number | null,
    setActiveChatId: React.Dispatch<React.SetStateAction<number | null>>
] | null;

export const ActiveChatIdContext = React.createContext<ActiveChatIdContextValueType>(null);

export function ActiveChatIdProvider({ children }: {children: React.ReactElement}) {
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    return (
        <ActiveChatIdContext.Provider value={[activeChatId, setActiveChatId]}>
            {children}
        </ActiveChatIdContext.Provider>
    );
}