import axios from "axios";
import {refreshRetryOnUnauthorized} from "./auth";
import {
    APIKeyRead,
    ChatFullCreate,
    ChatFullRead,
    ChatInfoRead,
    ChatRead,
    MessageAddToChatCreate,
    MessageFullRead,
    SystemPromptRead
} from "../types/dataTypes";
import {BACKEND_ORIGIN} from "../configuration/config.ts";

// Chats

export async function getAllChatsRequest(): Promise<ChatInfoRead[]> {
    const requestGenerator = () =>
        axios.get(BACKEND_ORIGIN + '/api/v1/chats/all', { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function getChatRequest(chatId: number): Promise<ChatFullRead> {
    const requestGenerator = () =>
        axios.get(BACKEND_ORIGIN + `/api/v1/chats/${chatId}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}


export async function createNewChatRequest(chat: ChatFullCreate): Promise<ChatFullRead> {
    const requestGenerator = () =>
        axios.post(BACKEND_ORIGIN + '/api/v1/chats/newChat', chat, {
            headers: {"Content-Type": "application/json"},
            withCredentials: true
        })
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function updateChatRequest(chat: ChatRead): Promise<ChatInfoRead> {
    const requestGenerator = () =>
        axios.put(BACKEND_ORIGIN + '/api/v1/chats/updateChat', chat, {
            headers: {"Content-Type": "application/json"},
            withCredentials: true
        });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function deleteChatRequest(chatId: number): Promise<ChatInfoRead> {
    const requestGenerator = () =>
        axios.delete(BACKEND_ORIGIN + `/api/v1/chats/deleteChat/${chatId}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

// Messages

export async function getMessageRequest(message_id: number): Promise<MessageFullRead> {
    const requestGenerator = () =>
        axios.get(BACKEND_ORIGIN + `/api/v1/messages/${message_id}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function createMessageRequest(message: MessageAddToChatCreate): Promise<MessageFullRead> {
    const requestGenerator = () =>
        axios.post(BACKEND_ORIGIN + '/api/v1/messages/newMessage', message, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

// Prompts

export async function getPopularSystemPromptsRequest(): Promise<SystemPromptRead[]> {
    const requestGenerator = () =>
        axios.get(BACKEND_ORIGIN + '/api/v1/prompt/system/popular', { withCredentials: true })
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}


export async function deleteSystemPromptsRequest(promptId: number): Promise<SystemPromptRead[]> {
    const requestGenerator = () =>
        axios.delete(BACKEND_ORIGIN + `/api/v1/prompt/system/deletePrompt/${promptId}`, { withCredentials: true })
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

// Keys


export async function saveAPIKeyRequest(token: string): Promise<unknown> {
    const requestGenerator = () =>
        axios.post(BACKEND_ORIGIN + '/api/v1/keys/save', { key: token }, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;    
}

export async function getAPIKeysRequest(): Promise<APIKeyRead[]> {
    const requestGenerator = () =>
        axios.get(BACKEND_ORIGIN + '/api/v1/keys/list', { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;    
}

export async function deleteAPIKeyRequest(keyId: string): Promise<unknown> {
    const requestGenerator = () =>
        axios.delete(BACKEND_ORIGIN + `/api/v1/keys/delete/${keyId}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;    
}