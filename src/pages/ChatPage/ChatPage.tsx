import ChatApp from "../../components/chat/ChatApp";
import { LocalAPIKeyProvider } from "../../contexts/LocalAPIKeyProvider.tsx";
import styles from "./style.module.css";

export default function ChatPage() {
    return (
        <div className={styles.chatAppPageWrapper}>
            <LocalAPIKeyProvider>
                <ChatApp/>
            </LocalAPIKeyProvider>
        </div>
    )
}