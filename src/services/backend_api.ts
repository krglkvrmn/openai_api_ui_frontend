import axios from "axios";
import { ChatType, MessageType } from "../types";


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

type SystemPromptBackendResponse = {
    content: string,
    popularity: number
};


export async function getAllChatsOverviewRequest(): Promise<ChatOverviewBackendResponse[]> {
    const response = await axios.get('http://localhost:8000/api/v1/chats/all', { withCredentials: true });
    return response.data;
}

export async function getChatRequest(chat_id: number): Promise<ChatBackendResponse> {
    const response = await axios.get(`http://localhost:8000/api/v1/chats/${chat_id}`, { withCredentials: true });
    return response.data;
}


export async function createNewChatRequest(chat: ChatType): Promise<ChatType> {
    return fetch('http://localhost:8000/api/v1/chats/newChat', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(chat),
        credentials: "include"
    }).then(response => response.json())
      .catch(error => console.error('Error:', error));
}

export async function updateChatRequest(chat: ChatOverviewBackendResponse): Promise<ChatOverviewBackendResponse> {
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

export async function getPopularSystemPromptsRequest(): Promise<SystemPromptBackendResponse[]> {
    const response = await axios.get('http://localhost:8000/api/v1/prompt/system/popular', { withCredentials: true })
    return response.data;
}