import styles from "./style.module.css";
import {ChatTutorial} from "../ChatTutorial/ChatTutorial.tsx";

export function EmptyChatPlaceholder() {
    return (
        <div className={styles.emptyChatPlaceholder}>
            <ChatTutorial/>
            <h2>Have a nice chat!</h2>
        </div>
    );
}
