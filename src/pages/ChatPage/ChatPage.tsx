import ChatApp from "../../components/chat/ChatApp";
import "./style.css";
import { LocalAPIKeyProvider } from "../../contexts/LocalAPIKeyProvider.tsx";

export default function ChatPage() {
    return (
        <div id="app-content">
            <LocalAPIKeyProvider>
                <ChatApp/>
            </LocalAPIKeyProvider>
        </div>
    )
}