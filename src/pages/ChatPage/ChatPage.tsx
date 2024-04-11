import ChatApp from "./ChatApp.tsx";
import styles from "./style.module.css";

export default function ChatPage() {
    return (
        <div className={styles.chatAppPageWrapper}>
            <ChatApp/>
        </div>
    )
}