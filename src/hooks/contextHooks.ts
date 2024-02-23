import React from "react";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import { APIKeyContext } from "../contexts/APIKeyProvider";
import { ActiveChatIndexContext } from "../contexts/ActiveChatIndexProvider";


function createContextHook<T>(context: React.Context<T | null>, onNotSetErrorMessage: string): () => T {
    return () => {
        const values = useContext(context);
        if (values === null) {
            throw new Error(onNotSetErrorMessage);
        }
        return values;
    }
}


export const useAPIKey = createContextHook(APIKeyContext, 'APIKey value is not set');
export const useActiveChatIndex = createContextHook(ActiveChatIndexContext, 'ActiveChatIndex value is not set');
export const useAuth = createContextHook(AuthContext, 'Auth provider value is not set');
