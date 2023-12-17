import { useContext } from "react";
import { ActiveChatIdContext } from "../contexts/ActiveChatIdProvider";

export function useActiveChatId() {
    const context = useContext(ActiveChatIdContext);
    if (context === null) {
        throw new Error('ActiveChatId value is not set');
    }
    return context;
}