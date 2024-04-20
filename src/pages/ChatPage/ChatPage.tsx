import ChatApp from "./ChatApp.tsx";
import styles from "./style.module.css";

export function ChatPage() {
    return (
        <div className={styles.chatAppPageWrapper}>
            <ChatApp/>
        </div>
    )
}