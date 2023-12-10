import React from "react";
import ChatController from "../../components/chat/ChatController";
import "./style.css";
import { ActiveChatIdProvider } from "../../contexts/ActiveChatIdProvider";

export default function ChatPage() {
    return (
        <div id="app-content">
            <ActiveChatIdProvider>
                <ChatController/>
            </ActiveChatIdProvider>
        </div>
    )
}