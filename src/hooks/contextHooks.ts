import React, {useContext} from "react";
import {AuthContext} from "../contexts/AuthProvider";
import {LocalAPIKeyContext} from "../pages/ChatPage/contexts/LocalAPIKeyProvider.tsx";
import {ActiveChatIndexContext} from "../pages/ChatPage/contexts/ActiveChatIndexProvider.tsx";
import {SystemPromptContext} from "../pages/ChatPage/contexts/SystemPromptProvider.tsx";
import {CollapsableEdgeElementContext} from "../components/ui/CollapsableEdgeElement/CollapsableEdgeElement.tsx";


export function createContextHook<T>(context: React.Context<T | null>, onNotSetErrorMessage: string): () => T {
    return () => {
        const values = useContext(context);
        if (values === null) {
            throw new Error(onNotSetErrorMessage);
        }
        return values;
    }
}


export const useLocalAPIKey = createContextHook(LocalAPIKeyContext, 'APIKey value is not set');
export const useActiveChatIndex = createContextHook(ActiveChatIndexContext, 'ActiveChatIndex value is not set');
export const useAuth = createContextHook(AuthContext, 'Auth provider value is not set');
export const useSystemPrompt = createContextHook(SystemPromptContext, 'System prompt value is not set');
export const useCollapsableEdgeElement = createContextHook(CollapsableEdgeElementContext, "Collapsable edge element value is not set");
