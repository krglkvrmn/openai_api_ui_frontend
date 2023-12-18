import axios from "axios";
import { ChatCreateType, ChatOverviewType, ChatType, MessageCreateType, MessageType } from "../types";
import { UUID } from "crypto";


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
    const response = await axios.get('http://localhost:8000/api/v1/chats/all', { withCredentials: true });
    return response.data;
}

export async function getChatRequest(chat_id: number): Promise<ChatBackendResponse> {
    const response = await axios.get(`http://localhost:8000/api/v1/chats/${chat_id}`, { withCredentials: true });
    return response.data;
}


export async function createNewChatRequest(chat: ChatCreateType): Promise<ChatBackendResponse> {
    const response = await axios.post('http://localhost:8000/api/v1/chats/newChat', chat, {
        headers: {"Content-Type": "application/json"},
        withCredentials: true
    })
    return response.data;
}

export async function updateChatRequest(chat: ChatOverviewType): Promise<ChatOverviewBackendResponse> {
    const response = await axios.put('http://localhost:8000/api/v1/chats/updateChat', chat, {
        headers: {"Content-Type": "application/json"},
        withCredentials: true
    });
    return response.data;
}

export async function deleteChatRequest(chat_id: number): Promise<ChatOverviewBackendResponse> {
    const response = await axios.delete(`http://localhost:8000/api/v1/chats/deleteChat/${chat_id}`, { withCredentials: true });
    return response.data;
}

// Messages

export async function getMessageRequest(message_id: number): Promise<MessageType> {
    const response = await axios.get(`http://localhost:8000/api/v1/messages/${message_id}`, { withCredentials: true });
    return response.data;
}

export async function createMessageRequest(message: MessageCreateType): Promise<MessageType> {
    const response = await axios.post('http://localhost:8000/api/v1/messages/newMessage', message, { withCredentials: true });
    return response.data;
}

// Prompts

export async function getPopularSystemPromptsRequest(): Promise<SystemPromptBackendResponse[]> {
    const response = await axios.get('http://localhost:8000/api/v1/prompt/system/popular', { withCredentials: true })
    return response.data;
}


export async function deleteSystemPromptsRequest(promptId: string): Promise<SystemPromptBackendResponse[]> {
    const response = await axios.delete(`http://localhost:8000/api/v1/prompt/system/deletePrompt/${promptId}`, { withCredentials: true })
    return response.data;
}

// Keys

export type APIKeysBackendResponse = {
    id: UUID,
    key: string
}

export async function saveAPIKeyRequest(token: string) {
    const response = await axios.post('http://localhost:8000/api/v1/keys/save', { key: token }, { withCredentials: true });
    return response.data;    
}

export async function getAPIKeysRequest(): Promise<APIKeysBackendResponse[]> {
    const response = await axios.get('http://localhost:8000/api/v1/keys/list', { withCredentials: true });
    return response.data;    
}

export async function deleteAPIKeyRequest(keyId: string) {
    const response = await axios.delete(`http://localhost:8000/api/v1/keys/delete/${keyId}`, { withCredentials: true });
    return response.data;    
}