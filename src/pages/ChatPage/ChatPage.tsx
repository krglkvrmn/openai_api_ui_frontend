import ChatApp from "../../components/chat/ChatApp";
import "./style.css";
import { APIKeyProvider } from "../../contexts/APIKeyProvider";

export default function ChatPage() {
    return (
        <div id="app-content">
            <APIKeyProvider>
                <ChatApp/>
            </APIKeyProvider>
        </div>
    )
}