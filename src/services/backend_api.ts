import { ChatType } from "../types";

export async function createNewChatRequest(chat: ChatType): Promise<ChatType> {
    return fetch('http://localhost:8000/api/v1/chats/newChat', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(chat),
        credentials: "include"
    }).then(response => response.json())
      .catch(error => console.error('Error:', error));
}

export async function updateChatRequest(chat: ChatType): Promise<ChatType> {
    return fetch('http://localhost:8000/api/v1/chats/updateChat', {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(chat),
        credentials: "include"
    }).then(response => response.json())
      .catch(error => console.error('Error:', error));
}

export async function deleteChatRequest(chat_id: number) {
    return fetch(`http://localhost:8000/api/v1/chats/deleteChat/${chat_id}`, {
        method: "DELETE",
        credentials: "include"
    }).then(response => response.json())
      .catch(error => console.error('Error:', error));
}