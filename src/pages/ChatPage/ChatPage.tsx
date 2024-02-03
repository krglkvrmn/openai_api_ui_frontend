import React from "react";
import ChatController from "../../components/chat/ChatController";
import "./style.css";
import { ActiveChatIdProvider } from "../../contexts/ActiveChatIdProvider";
import { Route, Routes } from "react-router-dom";
import { APIKeyProvider } from "../../contexts/APIKeyProvider";

export default function ChatPage() {
    return (
        <div id="app-content">
            <ActiveChatIdProvider>
                <APIKeyProvider>
                    <ChatController/>
                </APIKeyProvider>
            </ActiveChatIdProvider>
        </div>
    )
}