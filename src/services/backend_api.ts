import axios from "axios";
import { ChatCreateType, ChatIdType, ChatOverviewType, ChatType, MessageCreateType, MessageType } from "../types";
import { UUID } from "crypto";
import { refreshRetryOnUnauthorized } from "./auth";


export type ChatOverviewBackendResponse = {
    id: number,
    title: string,
    created_at: Date,
    last_updated: Date
}

type ChatBackendResponse = {
    id: number,
    title: string,
    model: string,
    messages: MessageType[]
    created_at: Date,
    last_updated: Date
}

export type SystemPromptBackendResponse = {
    id: string,
    content: string,
    popularity: number
};


// Chats

export async function getAllChatsOverviewRequest(): Promise<ChatOverviewBackendResponse[]> {
    const requestGenerator = () =>
        axios.get('http://localhost:8000/api/v1/chats/all', { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function getChatRequest(chatId: ChatIdType): Promise<ChatBackendResponse> {
    const requestGenerator = () =>
        axios.get(`http://localhost:8000/api/v1/chats/${chatId}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}


export async function createNewChatRequest(chat: ChatCreateType): Promise<ChatBackendResponse> {
    const requestGenerator = () =>
        axios.post('http://localhost:8000/api/v1/chats/newChat', chat, {
            headers: {"Content-Type": "application/json"},
            withCredentials: true
        })
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function updateChatRequest(chat: ChatOverviewType): Promise<ChatOverviewBackendResponse> {
    const requestGenerator = () =>
        axios.put('http://localhost:8000/api/v1/chats/updateChat', chat, {
            headers: {"Content-Type": "application/json"},
            withCredentials: true
        });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function deleteChatRequest(chatId: ChatIdType): Promise<ChatOverviewBackendResponse> {
    const requestGenerator = () =>
        axios.delete(`http://localhost:8000/api/v1/chats/deleteChat/${chatId}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

// Messages

export async function getMessageRequest(message_id: number): Promise<MessageType> {
    const requestGenerator = () =>
        axios.get(`http://localhost:8000/api/v1/messages/${message_id}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

export async function createMessageRequest(message: MessageCreateType): Promise<MessageType> {
    const requestGenerator = () =>
        axios.post('http://localhost:8000/api/v1/messages/newMessage', message, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

// Prompts

export async function getPopularSystemPromptsRequest(): Promise<SystemPromptBackendResponse[]> {
    const requestGenerator = () =>
        axios.get('http://localhost:8000/api/v1/prompt/system/popular', { withCredentials: true })
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}


export async function deleteSystemPromptsRequest(promptId: string): Promise<SystemPromptBackendResponse[]> {
    const requestGenerator = () =>
        axios.delete(`http://localhost:8000/api/v1/prompt/system/deletePrompt/${promptId}`, { withCredentials: true })
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;
}

// Keys

export type APIKeysBackendResponse = {
    id: UUID,
    key: string
}

export async function saveAPIKeyRequest(token: string) {
    const requestGenerator = () =>
        axios.post('http://localhost:8000/api/v1/keys/save', { key: token }, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;    
}

export async function getAPIKeysRequest(): Promise<APIKeysBackendResponse[]> {
    const requestGenerator = () =>
        axios.get('http://localhost:8000/api/v1/keys/list', { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;    
}

export async function deleteAPIKeyRequest(keyId: string) {
    const requestGenerator = () =>
        axios.delete(`http://localhost:8000/api/v1/keys/delete/${keyId}`, { withCredentials: true });
    const response = await refreshRetryOnUnauthorized(requestGenerator);
    return response.data;    
}