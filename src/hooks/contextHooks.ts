import { useContext } from "react";
import { ActiveChatIdContext } from "../contexts/ActiveChatIdProvider";
import { AuthContext } from "../contexts/AuthProvider";
import { APIKeyContext } from "../contexts/APIKeyProvider";


function createContextHook<T>(context: React.Context<T | null>, onNotSetErrorMessage: string) {
    return () => {
        const values = useContext(context);
        if (values === null) {
            throw new Error(onNotSetErrorMessage);
        }
        return values;
    }
}


export const useAPIKey = createContextHook(APIKeyContext, 'APIKey value is not set');
export const useActiveChatId = createContextHook(ActiveChatIdContext, 'ActiveChatId value is not set');
export const useAuth = createContextHook(AuthContext, 'Auth provider value is not set');
